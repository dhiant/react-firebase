import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const Datatable = ({ userColumns, productColumns }) => {
  const [userData, setUserData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  let location = useLocation();

  let pathname = location.pathname;
  let datagridColumns;

  if (pathname === "/users") {
    datagridColumns = userColumns;
  }
  if (pathname === "/products") {
    datagridColumns = productColumns;
  }

  useEffect(() => {
    if (datagridColumns === userColumns) {
      // const fetchDataFromCloudFirestore = async () => {
      // getting all documents from cloud firestore with no real time updates
      // put asynchronous code inside try/catch block
      // try {
      //   let list = [];
      //   const querySnapshot = await getDocs(collection(db, "users"));
      //   querySnapshot.forEach((doc) => {
      //     list.push({ id: doc.id, ...doc.data() });
      //   });
      //   setData(list);
      // } catch (err) {
      //   console.log(err);
      // }
      // };
      // fetchDataFromCloudFirestore();

      // getting real time updates with cloud firestore
      const unsub = onSnapshot(
        collection(db, "users"),
        (snapShot) => {
          let list = [];
          snapShot.docs.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          setUserData(list);
          setIsDataFetched(true);
        },
        (error) => {
          console.log(error);
        }
      );
      return () => {
        unsub();
      };
    }
    if (datagridColumns === productColumns) {
      const unsub = onSnapshot(collection(db, "products"), (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setProductData(list);
        setIsDataFetched(true);
      });
      return () => {
        unsub();
      };
    }
  }, [datagridColumns, productColumns, userColumns]);

  const handleDelete = async (id) => {
    // delete data from cloud firestore
    if (datagridColumns === userColumns) {
      try {
        await deleteDoc(doc(db, "users", id));
      } catch (err) {
        console.log(err);
      }
      setUserData(userData.filter((item) => item.id !== id));
    }
    if (datagridColumns === productColumns) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (err) {
        console.log(err);
      }
      setProductData(productData.filter((item) => item.id !== id));
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to="/users/test" style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        {datagridColumns === userColumns ? "Add New User" : "Add New Products"}

        <Link
          to={`${
            datagridColumns === userColumns ? "/users/new" : "/products/new"
          }`}
          className="link"
        >
          Add New
        </Link>
      </div>
      {isDataFetched ? (
        <DataGrid
          className="datagrid"
          rows={datagridColumns === userColumns ? userData : productData}
          columns={datagridColumns.concat(actionColumn)}
          pageSize={9}
          rowsPerPageOptions={[9]}
          checkboxSelection
        />
      ) : (
        <p>Getting the user...</p>
      )}
    </div>
  );
};

export default Datatable;
