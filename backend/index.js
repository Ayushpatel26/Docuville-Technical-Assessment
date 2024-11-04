const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/validate', (req, res) => {
  const { name, documentNumber, expirationDate } = req.body;
  console.log(name, documentNumber, expirationDate);

  // Simple validation example
  if (!name || !documentNumber || !expirationDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Check if expiration date is valid and in the future
  const expiry = new Date(expirationDate);
  if (expiry < new Date()) {
    return res.status(400).json({ message: 'Document is expired' });
  }

  res.status(200).json({ message: 'Document data is valid' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
