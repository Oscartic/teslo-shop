import { v4 as uuidv4 } from 'uuid';

export const fileNamer= (req: Express.Request, file: Express.Multer.File, callback: Function) => {
  
    if (!file) {
        return callback(new Error('File empty'), false);
    }

    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `image_${uuidv4()}.${fileExtension}`;

    callback(null, fileName);
};