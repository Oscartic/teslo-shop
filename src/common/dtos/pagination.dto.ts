import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @ApiProperty({
        default: 10,
        description: 'The page number for pagination'
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number) // enable implicit conversion of query params to number
    page?: number;
    
    @ApiProperty({
        example: 10,
        description: 'The number of items per page for pagination'
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    limit?: number;
    
    @ApiProperty({
        example: 0,
        description: 'The offset for pagination'
    })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset?: number;
}