import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { ReactSortable } from 'react-sortablejs';

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: existingCategory,
  properties: assignedProperties
}) {
  // useState
  const [title, setTitle] = useState(existingTitle || '');
  const [category, setCategory] = useState(existingCategory || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [price, setPrice] = useState(existingPrice || '');
  const [images, setImages] = useState(existingImages || []);
  const [gotoProducts, setGotoProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productProperties, setProductProperties] = useState(
    assignedProperties || {}
  );
  // hook
  const router = useRouter();
  // useEffect
  useEffect(() => {
    axios.get('/api/categories').then((result) => {
      setCategories(result.data);
    });
  }, []);

  const saveProduct = async (e) => {
    e.preventDefault();
    const data = {
      title,
      category,
      description,
      price,
      images,
      properties: productProperties
    };
    if (_id) {
      // update product
      await axios.put('/api/products', { ...data, _id });
    } else {
      // create product
      await axios.post('/api/products', data);
    }
    setGotoProducts(true);
  };

  if (gotoProducts) {
    router.push('/products');
  }

  const uploadImages = async (e) => {
    const files = e.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }
      const res = await axios.post('/api/upload', data);
      setImages((oldImages) => {
        return [...oldImages, ...res.data.links];
      });
      setIsUploading(false);
    }
  };

  const updateImageOrder = (images) => {
    setImages(images);
  };

  const setProductProp = (propName, value) => {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  };

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    catInfo && propertiesToFill.push(...catInfo?.properties);
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(
        ({ _id }) => _id === catInfo?.parent?._id
      );
      parentCat && propertiesToFill.push(...parentCat?.properties);
      catInfo = parentCat;
    }
  }

  return (
    <>
      <form onSubmit={saveProduct}>
        <label> Product Name </label>
        <input
          type="text"
          placeholder="product name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label> Category </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Uncategorized</option>
          {categories.length > 0 &&
            categories.map((c) => <option value={c._id}>{c.name}</option>)}
        </select>
        {propertiesToFill.length > 0 &&
          propertiesToFill.map((p) => (
            <div className="">
              <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
              <div>
                <select
                  value={productProperties[p.name]}
                  onChange={(e) => setProductProp(p.name, e.target.value)}
                >
                  {p.values.map((v) => (
                    <option value={v}> {v} </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        <label> Photos </label>
        <div className="mb-2 flex flex-wrap gap-1">
          <ReactSortable
            className="flex flex-wrap gap-1"
            list={images}
            setList={updateImageOrder}
          >
            {!!images?.length &&
              images.map((link, index) => (
                <div
                  key={link}
                  className="h-24 bg-white p-2 shadow-md border border-gray-100 rounded-lg"
                >
                  <img src={link} alt={`img-${index}`} className="rounded-lg" />
                </div>
              ))}
          </ReactSortable>
          {isUploading && (
            <div className="h-24 p-1 flex items-center ">
              <Spinner />
            </div>
          )}
          <label className="w-24 h-24 text-center flex items-center justify-center text-sm gap-1 text-gray-500 rounded-lg bg-white shadow-md border border-gray-100 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <div> Upload </div>
            <input type="file" onChange={uploadImages} className="hidden" />
          </label>
        </div>

        <label> Description </label>
        <textarea
          placeholder="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <label> Price (in USD) </label>
        <input
          type="number"
          placeholder="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Save
        </button>
      </form>
    </>
  );
}
