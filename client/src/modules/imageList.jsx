import React from 'react';
import '../../dist/styles.css';

const FullSize = (props) => (
  <div>
    <button className='rButton' onClick={props.onClick} font-weight='bold'>x</button>
    <table className='fullSize' images={props.images}>
      {props.images.map((image) => {
        return <tr><td><img className='rImg' src={image}></img></td></tr>
      })}
    </table>
  </div>
)

export default FullSize;