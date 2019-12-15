import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import Table from './modules/table.jsx';
import FullSize from './modules/imageList.jsx';
import Modal from 'react-modal';

Modal.setAppElement('#canvas');

const customStyle = {
  content: {
    top: '1px',
    left: '1px',
    right: '1px',
    bottom: '1px',
    padding: '0px'
  }
}

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      modalIsOpen: false
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount () {
    $.get('http://ec2-54-201-225-29.us-west-2.compute.amazonaws.com/api/images', {shoe_id: 0}, (data) => {
      this.setState({
        images: data.data
      })
    })
  }

  openModal () {
    this.setState({modalIsOpen: true});
  }

  closeModal () {
    this.setState({modalIsOpen: false});
  }

  render () {
    return (<div className='imgCanvas'>
      <Table images={this.state.images} onClick={this.openModal}/>
      <Modal style={customStyle} isOpen={this.state.modalIsOpen} images={this.state.images}>
        <FullSize images={this.state.images} onClick={this.closeModal} />
      </Modal>
    </div>)
  }
};

ReactDOM.render(<Canvas />, document.getElementById('canvas'));