import Busboy from 'busboy';
import bucket from '../config/firebase.js';

export const uploadFileToFirebase = async (file, filename) => {
    // Generate a unique filename for the uploaded file
    // const newFilename = `${Date.now()}_${file?.filename?.filename}`;

    // Create a reference to the Firebase Storage bucket

    // Upload the file to Firebase Storage
    const fileOptions = {
        metadata: {
            contentType: file.mimetype,
        },
    };
    await bucket.file(filename).save(file.buffer, fileOptions);

    // Make the uploaded file public
    await bucket.file(filename).makePublic();

    // Get the public URL of the uploaded file
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return fileUrl;
};
// export const uploadFileToFirebase = (files) => {
//     return new Promise((resolve, reject) => {
//         const busboy = Busboy({ headers: files.headers });
//         // const busboy = Busboy();
//         let fileToUpload;
//         const fileUrls = [];

//         busboy.on(
//             'file',
//             (fieldname, fileStream, filename, encoding, mimetype) => {
//                 console.log('FILE', filename);
//                 // Set the desired filename in Firebase Storage
//                 const newFilename = `${Date.now()}_${filename}`;
//                 const uploadOptions = {
//                     destination: newFilename,
//                     resumable: false,
//                     metadata: {
//                         metadata: {
//                             contentType: mimetype,
//                         },
//                     },
//                 };

//                 fileToUpload = fileStream;
//                 const fileUrl = `gs://${bucket.name}/${newFilename}`;
//                 fileUrls.push(fileUrl);

//                 // Upload the file to Firebase Storage
//                 fileStream.pipe(
//                     bucket.file(newFilename).createWriteStream(uploadOptions),
//                 );
//             },
//         );

//         busboy.on('finish', () => {
//             console.log('FINISH');
//             resolve(fileUrls);
//         });

//         busboy.on('error', (error) => {
//             console.log('EROROR FINISH', error);
//             reject(error);
//         });

//         files.files.forEach((file) => {
//             console.log('WRITE', file);
//             busboy.write(file.buffer);
//         });

//         // busboy.end();
//         // fileToUpload.pipe(busboy);
//     });
// };
