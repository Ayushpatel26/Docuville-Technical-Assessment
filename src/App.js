import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [image, setImage] = useState(null);
  const [data, setData] = useState({ name: '', documentNumber: '', expirationDate: '' });
  const [loading, setLoading] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [IsSubmitting, setIsSubmitting] = useState(false);
  const [IsSubmitted, setIsSubmitted] = useState(false);

  const handleImageChange = (e) => {
    setIsClicked(false);
    setImage(e.target.files[0]);
  };

  const extractText = () => {
    setLoading(true);
    Tesseract.recognize(image, 'eng', { logger: (m) => console.log(m) })
      .then(({ data: { text } }) => {
        setLoading(false);
        parseText(text);
        setIsClicked(true);
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error extracting text:', error);
      });
  };

  const parseText = (text) => {
    const name = text.match(/Name\s*:\s*([A-Za-z]+\s+[A-Za-z]+)/i)?.[1] || '';// for handling 2 words name
    // const name = text.match(/Name\s*:\s*([A-Za-z]+\s+[A-Za-z]+\s?[A-Za-z]*)/i)?.[1] || '';// for handling 3 words name
    const documentNumber = text.match(/DL No:\s*([A-Z0-9]+)/i)?.[1] || '';
    const expirationDate = text.match(/Valid Till:\s*(\d{2}-\d{2}-\d{2}|DD-MM-YY)/i)?.[1] || '';

    setData({ name, documentNumber, expirationDate });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setIsSubmitted(true);
    try {
      const response = await axios.post('http://localhost:3001/validate', data);
      toast.success("Submitted successfully", response.data.message);
    } catch (error) {
      toast.error('Submission failed: ' + error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto flex flex-col justify-center items-center min-h-screen w-1/2 shadow-md bg-gray-100">
      <h1 className='text-3xl font-bold my-2'>Document Data Extraction</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />

      {image && (<button
        onClick={extractText}
        disabled={isClicked}
        className={`mx-auto my-2 w-1/3 border block text-center ${isClicked ? 'bg-gray-400' : 'bg-blue-500'} text-white px-4 py-2 font-medium rounded`}
        >
        {loading ? 'Please Wait...' : 'Extract Text'}
      </button>)}

      {isClicked && ((data.name && data.documentNumber && data.expirationDate) ? (
        <div className='shadow-md bg-green-100 font-medium rounded w-fit px-10 py-3'>
          <h3 className='text-center text-xl font-semibold'>Extracted Data</h3>
          <p>Name: {data.name}</p>
          <p>Document Number: {data.documentNumber}</p>
          <p>Expiration Date: {data.expirationDate}</p>
        </div>
      ) : (
        <div>Invalid image uploaded!</div>
      ))}

      {isClicked && (<button
        onClick={handleSubmit}
        disabled={!data.name || !data.documentNumber || !data.expirationDate || IsSubmitted}
        className={`mx-auto my-2 w-1/3 border block text-center ${IsSubmitted ? 'bg-gray-400' : 'bg-green-500'} text-white px-4 py-2 font-medium rounded`}
      >
        {IsSubmitting ? 'Please Wait...' : 'Submit to Server'}
      </button>)}

      {IsSubmitted && (
        <button
          onClick={() => window.location.reload()}
          className='my-2 bg-green-500 text-white font-medium px-4 py-2 rounded'
        >
          Refresh
        </button>
      )}

      <ToastContainer />
    </div>
  );
};

export default App;
