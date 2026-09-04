import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product, ProductImage } from './entities';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger('«ProductsService»');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) {
  
  }

  async create(createProductDto: CreateProductDto) {
   try {
    
    const { images = [], ...productDetails } = createProductDto;

    const product = this.productRepository.create({
      ...productDetails,
      images: images.map( image => this.productImageRepository.create({ url: image }) )
    });
    await this.productRepository.save(product);
    return { ...product, images };
   } catch (error) {
     this.handleDBExceptions(error);
   }

  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true
        }
        // TODO relations 
      });

      return products.map( ({images, ...rest}) => ({
        ...rest,
        images: images?.map( img => img.url )
      }));
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(search: string) {

    let product: Product | null = null;

    if( isUUID(search) ) {
      product = await this.productRepository.findOneBy({ id: search });
    } else {
      // product = await this.productRepository.findOneBy({ slug: search });
      const queryBuilder = this.productRepository.createQueryBuilder('p');
      product = await queryBuilder
        .where('p.slug = :slug OR p.title ILIKE :title', { 
          slug: search,
          title: (`%${search}%`),
        })
        .leftJoinAndSelect('p.images', 'image')
        .getOne();
    }

    if(!product) {
      throw new NotFoundException(`Product with id ${search} not found`);
    }
    return product;
  }

  async findOnePlain(q: string) {
    const { images = [], ...rest } = await this.findOne(q);
    return {
      ...rest,
      images: images.map( image => image.url )
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;
    
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if(!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if(images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map( image => 
          this.productImageRepository.create({ url: image }) 
        );
        await queryRunner.manager.save(product);
      }

      await queryRunner.commitTransaction();

      return this.findOnePlain(id);
    } catch (error) {

      await queryRunner.rollbackTransaction(); 
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
// ******* PRIVATE METHODS ******* //
  private handleDBExceptions(error: any) {
    if(error.code === '23505') {
      this.logger.warn(JSON.stringify(`${error.parameters} ${error.detail}`));
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error.detail);
    throw new InternalServerErrorException('Unexpected error. Please check server logs');
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('products');

    try {
      return await query
        .delete()
        .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  } 
}