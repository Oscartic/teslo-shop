import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./";
import { User } from "../../auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' })
export class Product {
    @ApiProperty({
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        description: 'The unique identifier of the product',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({
        example: 'Product Title',
        description: 'The title of the product',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title!: string;
    
    @ApiProperty({
        example: 99.99,
        description: 'The price of the product'
    })
    @Column('float', {
        default: 0
    })
    price!: number;

    @ApiProperty({
        example: 'This is a product description',
        description: 'The description of the product'
    })
    @Column('text', {
        nullable: true,
    })
    description!: string;

    @ApiProperty({
        example: 'product-title',
        description: 'The slug of the product',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug!: string;

    @ApiProperty({
        example: 10,
        description: 'The stock of the product'
    })
    @Column('int', {
        default: 0
    })
    stock!: number;

    @ApiProperty({
        example: 10,
        description: 'The available sizes of the product'
    })
    @Column('text', {
        array: true,
    })
    sizes!: string[];

    @ApiProperty({
        example: ['men', 'women', 'unisex'],
        description: 'The gender category of the product'
    })
    @Column('text')
    gender!: string;
    //tags
    @ApiProperty({
        example: ['tag1', 'tag2'],
        description: 'The tags associated with the product'
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags!: string[];
    //images
    @ApiProperty({ type: () => [ProductImage] })
    @OneToMany(() => ProductImage, (productImage) => productImage.product, {
        cascade: true,
        eager: true
    })
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user!: User;

    @BeforeInsert()
    checkSlugInsert() {
        if(!this.slug) {
            this.slug = this.title.toLowerCase().replaceAll(' ', '_');
        } else {
            this.slug = this.slug.toLowerCase().replaceAll(' ', '_');
        }
    }
    // @BeforeUpdate
    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug.toLowerCase().replaceAll(' ', '_');
    }
}