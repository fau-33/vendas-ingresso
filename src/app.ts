import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    res.send();
})

app.post('/partners', (req, res) => {
    const {name, email, password, company_name} = req.body;
})

app.post('/events', (req, res) => {
    const {name,description, date, location } = req.body;
})

app.get('/events', (req, res) => {
    
})

app.get('/events/:eventId', (req, res) => {
    const {eventId} = req.params;
    console.log(eventId);

    res.send()
})


app.listen(3000, () => {
    console.log('Server started on port 3000');
});