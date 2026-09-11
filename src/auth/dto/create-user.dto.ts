import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, MaxLength, Matches } from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        description: 'The email of the user',
        nullable: false
    })
    @IsString()
    @IsEmail()
    email!: string;

    @ApiProperty({
        description: 'The password of the user',
        nullable: false,
        minLength: 6,
        maxLength: 50
    })
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password!: string;

    @ApiProperty({
        description: 'The full name of the user',
        nullable: false,
        minLength: 3
    })
    @IsString()
    @MinLength(3)
    fullName!: string;
}
