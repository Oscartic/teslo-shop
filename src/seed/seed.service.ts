import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
  
  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return 'This action runs the seed';
  }

  private async deleteTables () {
    await this.productsService.deleteAllProducts();

    const QueryBuilder = this.userRepository.createQueryBuilder();
    await QueryBuilder.delete().execute();  
  
  }

  private async insertUsers() {
    const users = initialData.users;

    const insertPromises = users.map(async user => {
      user.password = await bcrypt.hash(user.password, 10);
      return this.userRepository.save(user);
    });
    const [adminUser] = await Promise.all(insertPromises);
    console.log(adminUser);
    return adminUser;
  }
  
  private async insertNewProducts(user: User) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = products.map(product => 
      this.productsService.create(product, user)
    );
    await Promise.all(insertPromises);
    
    return true;
  }
}
