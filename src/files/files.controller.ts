import { BadRequestException, Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';
import type { Response } from 'express';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {
    const imagePath = this.filesService.getStaticProductImage(imageName);
    
    res.sendFile(imagePath);
  }
  

  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }) )
  uploadProductImage(
     @UploadedFile() file: Express.Multer.File
  ) {

    if(!file) {
      throw new BadRequestException('File is required');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
    
    return { secureUrl };
  }
}
