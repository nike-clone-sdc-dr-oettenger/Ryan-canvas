import React from 'react';
import '../../dist/styles.css';

const FullSize = (props) => (
  <div>
    <button onClick={props.onClick} font-weight='bold'>x</button>
    <div>{props.images}</div>
    <table className='fullSize'>
      <tr>
        {props.images.map((image) => {
          <tr>
            <td><img src={image}></img></td>
          </tr>
        })}
      </tr>
    </table>
  </div>
)

export default FullSize;