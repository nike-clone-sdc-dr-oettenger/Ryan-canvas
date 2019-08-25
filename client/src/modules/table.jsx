import React from 'react';
import '../../dist/styles.css';

let leftImg

const Table = (props) => (
  <div>
    <table>
      <tr>
      {props.images.map((imgSrc, i) => {
        if (!(i%2)) {
          leftImg = <td className='img'><img src={imgSrc}></img></td>
          if (i === props.images.length-1) {
            return <tr>{leftImg}</tr>
          }
        } else {
          console.log('else', i%2)
          return <tr>{leftImg}<td className='img'><img src={imgSrc}></img></td></tr>
        }
      })}
      </tr>
    </table>
  </div>
)

export default Table;