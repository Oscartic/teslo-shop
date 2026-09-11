import { ApiProperty } from '@nestjs/swagger';
import { 
    IsString,
    IsNumber,
    IsOptional,
    IsArray,
    MinLength,
    IsPositive,
    IsInt,
    IsIn
} from 'class-validator';

export class CreateProductDto {
   
    @ApiProperty({
        description: 'The title of the product (unique)',
        nullable: false,
        minLength: 1,  
    })
    @IsString()
    @MinLength(1)
    title!: string;

    @ApiProperty({
        description: 'The price of the product',
        nullable: false,
        minimum: 0.01
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price!: number;

    @ApiProperty({
        description: 'The description of the product',
        nullable: true
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'The slug of the product',
        nullable: true
    })
    @IsString()
    @IsOptional()
    slug!: string;

    @ApiProperty({
        description: 'The stock of the product',
        nullable: true,
        minimum: 0
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty({
        description: 'The available sizes of the product',
        nullable: false,
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    sizes!: string[];
    @ApiProperty({
        description: 'The gender category of the product',
        nullable: false,
        enum: ['men', 'women', 'kid', 'unisex']
    })
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender!: string;

    @ApiProperty({
        description: 'The tags associated with the product',
        nullable: true,
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @ApiProperty({
        description: 'The images of the product',
        nullable: true,
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];
}
