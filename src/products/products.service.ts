import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger('«ProductsService»');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {
  
  }

  async create(createProductDto: CreateProductDto) {
   try {
    const product = this.productRepository.create(createProductDto);
    await this.productRepository.save(product);
    return product;
   } catch (error) {
     this.handleDBExceptions(error);
   }

  }

  findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      return this.productRepository.find({
        take: limit,
        skip: offset,
        // TODO relations 
      });
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
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('slug = :slug OR title ILIKE :title', { 
          slug: search,
          title: (`%${search}%`),
        })
        .getOne();
    }

    if(!product) {
      throw new NotFoundException(`Product with id ${search} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto
    });

    if(!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
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
}