import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns } from "../../datatablesource";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const Datatable = () => {
  const [data, setData] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
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
        setData(list);
        setIsDataFetched(true);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  const handleDelete = async (id) => {
    // delete data from cloud firestore
    try {
      await deleteDoc(doc(db, "users", id));
    } catch (err) {
      console.log(err);
    }
    setData(data.filter((item) => item.id !== id));
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
        Add New User
        <Link to="/users/new" className="link">
          Add New
        </Link>
      </div>
      {isDataFetched ? (
        <DataGrid
          className="datagrid"
          rows={data}
          columns={userColumns.concat(actionColumn)}
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
