import fs from 'fs';
import os from 'os';
import path from 'path';
import Busboy from 'busboy';
import bucket from '../config/firebase.js';

// const uploadFileToFirebase = async (file) => {
//     // Generate a unique filename for the uploaded file
//     const newFilename = `${Date.now()}_${file.originalname}`;

//     // Create a reference to the Firebase Storage bucket
//     const bucket = storage.bucket('your-bucket-name');

//     // Upload the file to Firebase Storage
//     const fileOptions = {
//         metadata: {
//             contentType: file.mimetype,
//         },
//     };
//     await bucket.file(newFilename).save(file.buffer, fileOptions);

//     // Get the public URL of the uploaded file
//     const fileUrl = `https://storage.googleapis.com/${bucket.name}/${newFilename}`;

//     return fileUrl;
// };

// export const imageUploadFirebase = (req, res, next) => {
//     const busboy = Busboy({ headers: req.headers });

//     let uploadedFileName;
//     const currentDate = new Date().toISOString().replace(/[:.]/g, '');

//     busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
//         const uniqueFileName = `borrower_${currentDate}`;
//         const filePath = path.join(os.tmpdir(), uniqueFileName);

//         const uploadStream = bucket.file(uniqueFileName).createWriteStream();

//         file.pipe(fs.createWriteStream(filePath));

//         file.on('end', async () => {
//             try {
//                 await bucket.upload(filePath, {
//                     destination: `borrower/image/${uniqueFileName}`,
//                     metadata: {
//                         contentType: mimetype,
//                     },
//                 });

//                 fs.unlinkSync(filePath); // Delete the temporary file

//                 console.log('File uploaded successfully');
//                 uploadedFileName = uniqueFileName;
//             } catch (error) {
//                 console.error('Error uploading file:', error);
//                 res.status(500).send('File upload failed');
//             }
//         });
//     });

//     busboy.on('finish', () => {
//         req.uploadedFileName = uploadedFileName; // Attach uploaded file name to the request object
//         next();
//     });

//     busboy.on('close', () => {
//         console.log('Done parsing form!');
//         // res.writeHead(303, { Connection: 'close', Location: '/' });
//         // res.end();
//     });
//     // busboy.end(req.rawBody);
// };
