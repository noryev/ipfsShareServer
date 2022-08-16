import ipfsClient from 'ipfs-http-client';
import express from 'express';
import { urlencoded } from 'body-parser';
import fileUpload from 'express-fileupload';
const fs = require(fs);

const ipfs = new ipfsClient({ host: 'localhost', port: '5001', protocol: 'http'});
const app = express();

app.set('view engine' , 'ejs');
app.use(urlencoded({extended: true}));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.render('home');
})

app.post('/upload', (req,res) => {
    const file = req.files.file;
    const fileName = req.body.fileName;
    const filePath = 'files/' + fileName;

    file.mv(filePath, async(err) => {
        if (err) {
            console.log('error: failed to download the file')
            return res.status(500).send(err);

        }

        const fileHash = await addFile(fileName, filePath);
        fs.unlink(filePath, (err) => {
            if (err) console.log(err);

    });

    res.render('upload', { fileName, fileHash});


    });

});

const addFile = async (fileName, filePath) => {
    const file = fs.readFileSync(filePath);
    let results = [];
    for await (const result of ipfs.add({path: fileName, content: file})) {
        results.push(result);
    }
    return results[0].cid;

};

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});