import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import Table from './modules/table.jsx'

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: []
    }
  }

  componentDidMount () {
    $.get('http://0.0.0.0:1121/api/images', {shoe_id: 0}, (data) => {
      this.setState({
        images: data
      })
    })
  }

  render () {
    return (<div className='imgCanvas'>
      <Table images={this.state.images}/>
    </div>)
  }
};

ReactDOM.render(<Canvas />, document.getElementById('canvas'));