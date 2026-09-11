import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { Product } from './entities';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Products')
@Controller('products')
@Auth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'The product has been successfully created.', type: Product })
  @ApiResponse({ status: 400, description: 'Bad Request.' }) 
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    // console.log('Pagination DTO:', paginationDto);
    return this.productsService.findAll(paginationDto);
  }

  @Get(':search')
  findOne(@Param('search') search: string) {
    return this.productsService.findOnePlain(search);
  }

  @Patch(':id')
  @Auth(ValidRoles.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
