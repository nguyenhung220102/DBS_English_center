import DefaultLayout from '../Layouts/DefaultLayout/DefaultLayout';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {} from 'mdb-react-ui-kit';
import { Button, Form, InputGroup, Modal, OverlayTrigger, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { getBranches, getCourses, getSyllabuss } from '../api/courseAPI';
import axios from 'axios';

const DELETE = 'delete';
const ADD = 'add';
const UPDATE = 'update';
const HIDDEN = 'hidden';

function Course() {
  const [courses, setCourses] = useState([]);
  const [syllabuss, setSyllabuss] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState({ type: HIDDEN, payload: '' }); //
  const [searchKey, setSearchKey] = useState('');

  // call APi
  const getData = async () => {
    await getCourses().then((data) => setCourses(data));
    await getSyllabuss().then((data) => setSyllabuss(data));
    await getBranches().then((data) => setBranches(data));
  };

  useEffect(() => {
    getData();
  }, []);

  //show/hide modal
  const handleOpen = (type, payload) => {
    setShowModal({ type, payload });
  };
  const handleClose = () => setShowModal((prev) => ({ ...prev, type: HIDDEN }));
  const getCourseById = (id) => courses.find((item) => item.c_ID === id);

  //search Course
  const handleSearch = (key) => {
    axios.get(`http://localhost:3003/course?name=${key}`).then((res) => setCourses(res.data[0]));
  };
  //delelte course
  const handleDeleteCourse = (id) => {
    axios.delete(`http://localhost:3003/course/${id}`).then((res) => {
      handleClose();
      getCourses().then((data) => setCourses(data));
    });
  };

  // Edit course
  const handleUpdateCourse = (e, c_ID) => {
    e.preventDefault();
    let form = e.target;
    let c_name = form.c_name.value,
      fee = Number(form.fee.value),
      branch = form.branch.value,
      syllabus = form.syllabus.value,
      s_date = form.s_date.value,
      e_date = form.e_date.value;

    axios
      .put(`http://localhost:3003/course/${c_ID}`, {
        c_name: c_name,
        fee: fee,
        s_date: s_date,
        e_date: e_date,
        fk_syl_ID: syllabus,
        fk_dnum: branch,
      })
      .then((res) => {
        handleClose();
        getCourses().then((data) => setCourses(data));
      })
      .catch((err) => console.log('Đã xảy ra lỗi: ', err));
  };

  // ADD course
  const handleAddCourse = (e) => {
    e.preventDefault();
    let form = e.target;
    let id = form.c_id.value,
      c_name = form.c_name.value,
      fee = Number(form.fee.value),
      branch = form.branch.value,
      syllabus = form.syllabus.value,
      s_date = form.s_date.value,
      e_date = form.e_date.value;

    axios
      .post('http://localhost:3003/course', {
        c_ID: id,
        c_name: c_name,
        fee: fee,
        s_date: s_date,
        e_date: e_date,
        fk_syl_ID: syllabus,
        fk_dnum: branch,
      })
      .then((res) => {
        alert('successfully!');
        handleClose();
        getCourses().then((data) => setCourses(data));
      })
      .catch((err) => console.log('Đã xảy ra lỗi: ', err));
  };

  return (
    <DefaultLayout>
      <div className="px-5 my-3">
        <h1>Khoá học</h1>
        <div className="my-3 d-flex align-items-center justify-content-between">
          <InputGroup className="w-50">
            <InputGroup.Text>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Tìm kiếm........."
              defaultValue={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e.target.value);
                }
              }}
            />
          </InputGroup>
          <Button variant="primary" onClick={() => handleOpen(ADD, '')}>
            Thêm khoá học
          </Button>
        </div>
        {courses ? (
          <Table className="pt-3">
            <thead>
              <tr>
                <th>Mã khoá học</th>
                <th>Tên khoá học</th>
                <th>Mã chi nhánh</th>
                <th>Mã chương trình học</th>
                <th>Học phí</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Hành động</th>
              </tr>
            </thead>

            <tbody>
              {courses.map((item, index) => (
                <tr key={index}>
                  <td>{item.c_ID}</td>
                  <td>{item.c_name}</td>
                  <td>{item.fk_dnum}</td>
                  <td>{item.fk_syl_ID}</td>
                  <td>{item.fee}</td>
                  <td>{moment.utc(showModal.payload.s_date).format('YYYY-MM-DD')}</td>
                  <td>{moment.utc(showModal.payload.e_date).format('YYYY-MM-DD')}</td>
                  <td>
                    <Button variant="info">
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        onClick={() => handleOpen(UPDATE, getCourseById(item.c_ID))}
                      />
                    </Button>{' '}
                    <Button variant="danger" onClick={() => handleOpen(DELETE, item.c_ID)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No record</p>
        )}
      </div>
      {/* add new course modal */}
      <Modal show={showModal.type === ADD} onHide={handleClose} size="lg" backdrop="static">
        <form onSubmit={(e) => handleAddCourse(e)}>
          <Modal.Header closeButton>
            <Modal.Title>
              <h4>Tạo khoá học mới</h4>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group my-2">
              ID
              <input name="c_id" className="form-control" placeholder="ID" />
            </div>
            <div className="form-group my-2">
              Tên khoá học
              <input name="c_name" className="form-control" placeholder="Tên khoá học" />
            </div>

            <div className="form-group my-2">
              Học phí
              <input name="fee" className="form-control" placeholder="Học phí" />
            </div>

            <div className="d-flex align-items-center">
              <div className="form-group me-3 w-50">
                Chi nhánh
                <select className="form-select" defaultValue={''} name="branch">
                  <option value="0">----------</option>
                  {branches.map((item, index) => (
                    <option value={item.dnum} key={index}>
                      {item.dnum}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group my-2 w-50">
                Chương trình học
                <select className="form-select" defaultValue={''} name="syllabus">
                  <option value="0">----------</option>
                  {syllabuss.map((item, index) => (
                    <option value={item.syl_ID} key={index}>
                      {item.content}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group my-2">
              Ngày bắt đầu
              <input type={'date'} className="form-control" placeholder="Tên khoá học" name="s_date" />
            </div>

            <div className="form-group my-2">
              Ngày kết thúc
              <input type={'date'} className="form-control" placeholder="Tên khoá học" name="e_date" />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" className="border font-weight-normal px-5" onClick={handleClose}>
              Huỷ
            </Button>
            <Button variant="primary" type="submit">
              Xác nhận
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* delete course modal */}
      <Modal show={showModal.type === DELETE} onHide={handleClose} size="" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            <h4>Xác nhận xoá khoá học</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>Bạn chắc chắn chứ ?</h6>
          <p>Sau khi xoá dữ liệu về khoá học sẽ không thể khôi phục</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="border font-weight-normal px-5" onClick={handleClose}>
            Huỷ
          </Button>
          <Button variant="danger" onClick={() => handleDeleteCourse(showModal.payload)}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>

      {/* edit course modal */}
      <Modal show={showModal.type === UPDATE} onHide={handleClose} size="lg" backdrop="static">
        <form onSubmit={(e) => handleUpdateCourse(e, showModal.payload.c_ID)}>
          <Modal.Header closeButton>
            <Modal.Title>
              <h4>Cập nhật khoá học</h4>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group my-2">
              ID
              <input
                name="c_id"
                className="form-control opacity-50"
                readOnly
                defaultValue={showModal.payload.c_ID}
                data-toggle="tooltip"
                data-placement="top"
                title="Trường này không thể sửa"
              />
            </div>
            <div className="form-group my-2">
              Tên khoá học
              <input
                name="c_name"
                className="form-control"
                placeholder="Tên khoá học"
                defaultValue={showModal.payload.c_name}
              />
            </div>

            <div className="form-group my-2">
              Học phí
              <input name="fee" className="form-control" placeholder="Học phí" defaultValue={showModal.payload.fee} />
            </div>

            <div className="d-flex align-items-center">
              <div className="form-group me-3 w-50">
                Chi nhánh
                <select className="form-select" defaultValue={showModal.payload.fk_dnum} name="branch">
                  <option value="0">----------</option>
                  {branches.map((item, index) => (
                    <option value={item.dnum} key={index}>
                      {item.dnum}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group my-2 w-50">
                Chương trình học
                <select className="form-select" defaultValue={showModal.payload.fk_syl_ID} name="syllabus">
                  <option value="0">----------</option>
                  {syllabuss.map((item, index) => (
                    <option value={item.syl_ID} key={index}>
                      {item.content}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group my-2">
              Ngày bắt đầu
              <input
                type={'date'}
                defaultValue={moment.utc(showModal.payload.s_date).format('YYYY-MM-DD')}
                className="form-control"
                placeholder="Tên khoá học"
                name="s_date"
              />
            </div>

            <div className="form-group my-2">
              Ngày kết thúc
              <input
                type={'date'}
                defaultValue={moment.utc(showModal.payload.e_date).format('YYYY-MM-DD')}
                className="form-control"
                placeholder="Tên khoá học"
                name="e_date"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" className="border font-weight-normal px-5" onClick={handleClose}>
              Huỷ
            </Button>
            <Button variant="primary" type="submit">
              Xác nhận
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </DefaultLayout>
  );
}

export default Course;
