import Layout from '@/components/Layout';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { withSwal } from 'react-sweetalert2';

const Categories = ({ swal }) => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [parentCategory, setParentCategory] = useState('');
  const [editedCategory, setEditedCategory] = useState(null);
  const [properties, setProperties] = useState([]);

  const saveCategory = async (e) => {
    e.preventDefault();
    const data = {
      name,
      parentCategory,
      properties: properties.map((p) => ({
        name: p.name,
        values: p.values.split(',')
      }))
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put('/api/categories', data);
      setEditedCategory(null);
    } else {
      await axios.post('/api/categories', data);
    }
    setName('');
    setParentCategory('');
    setProperties([]);
    fetchCategories();
  };

  const fetchCategories = () => {
    axios.get('/api/categories').then((result) => {
      setCategories(result.data);
    });
  };

  const editCategory = (category) => {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(',')
      }))
    );
  };

  const deleteCategory = (category) => {
    swal
      .fire({
        title: 'Are you sure?',
        text: `Do you want to delete "${category.name}"?`,
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Yes, Delete!',
        confirmButtonColor: '#d55',
        reverseButtons: true
      })
      .then(async (result) => {
        // when confirmed and promise resolved...
        console.log({ result });
        if (result.isConfirmed) {
          const { _id } = category;
          await axios.delete('/api/categories?_id=' + _id);
          fetchCategories();
        }
      })
      .catch((error) => {
        // when promise rejected...
      });
  };

  const addProperty = () => {
    setProperties((prev) => {
      return [...prev, { name: '', values: '' }];
    });
  };

  const handlePropertyNameChange = (property, index, newName) => {
    console.log({ property, index, newName });
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  };

  const handlePropertyValuesChange = (property, index, newValues) => {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  };

  const removeProperty = (indexToRemove) => {
    setProperties((prev) => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Layout>
      <h1>Categories</h1>
      <label className="mb-1">
        {editedCategory ? 'Edit category' : 'Create category name'}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            value={parentCategory}
            onChange={(e) => setParentCategory(e.target.value)}
          >
            <option value=""> No parent category </option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option value={category._id}>{category.name}</option>
              ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block mb-1"> Properties </label>
          <button
            type="button"
            onClick={addProperty}
            className="btn-default text-sm mb-2"
          >
            Add new property
          </button>
          {properties.length > 0 &&
            properties.map((property, index) => (
              <div key={property} className="flex gap-1 mb-2">
                <input
                  type="text"
                  placeholder="property name (example: color)"
                  className="mb-0"
                  value={property.name}
                  onChange={(e) =>
                    handlePropertyNameChange(property, index, e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="values, comma separated"
                  className="mb-0"
                  value={property.values}
                  onChange={(e) =>
                    handlePropertyValuesChange(property, index, e.target.value)
                  }
                />
                <button
                  className="btn-red"
                  type="button"
                  onClick={() => removeProperty(index)}
                >
                  Remove
                </button>
              </div>
            ))}
        </div>
        <div className="flex gap-1">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName('');
                setParentCategory('');
                setProperties([]);
              }}
              className="btn-default"
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary">
            Save
          </button>
        </div>
      </form>

      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Category name</td>
              <td>Parent category</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category) => (
                <tr>
                  <td>{category.name}</td>
                  <td>{category.parent?.name}</td>
                  <td>
                    <button
                      onClick={() => editCategory(category)}
                      className="btn-primary mr-1"
                    >
                      Edit
                    </button>
                    <button
                      className="btn-red"
                      onClick={() => deleteCategory(category)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
};

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
