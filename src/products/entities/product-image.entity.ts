import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Product } from "./";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'product_images' })
export class ProductImage {
    @ApiProperty({
        description: 'The ID of the product image',
        nullable: false
    })
    @PrimaryGeneratedColumn()
    id!: number;
    
    @ApiProperty({
        description: 'The URL of the product image',
        nullable: false
    }) 
    @Column('text')
    url!: string;

    @ManyToOne(
        () => Product, (product) => product.images,
        { onDelete: 'CASCADE' }
    )
    product!: Product;
}