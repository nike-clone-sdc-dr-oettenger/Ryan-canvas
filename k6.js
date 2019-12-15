import http from "k6/http";
import { check, fail } from "k6";


export let options = {
  throw: true,
}

export default function() {
  const testType = __ENV.k6_type || 'GET'
  const testURL = __ENV.k6_url || 'http://127.0.0.1:1121/api/images'
  if (testType === 'GET') {
    let shoe_id = Math.floor(Math.random() * 10000000)
    // let shoe_id = 0
    let res = http.get(`${testURL}?shoe_id=${shoe_id}`);
    if (!check(res, {
      "status code MUST be 200": (res) => {
        return res.status === 200
      },
    })) {
      fail("status code was *not* 200");
    }
  } else if (testType === 'POST') {
    var payload = JSON.stringify({ shoe_id: 999, img1: "https://picsum.photos/id/1/400/600", img2: "https://picsum.photos/id/1/400/600", img3: "https://picsum.photos/id/1/400/600", img4: "https://picsum.photos/id/1/400/600",img5: "https://picsum.photos/id/1/400/600"});
    var params =  { headers: { "Content-Type": "application/json" } }
    let res = http.post(testURL, payload, params)

    if(!check(res, {
      "status code MUST be 201": (res) => {
        return res.status === 201
      },
    })) {
      fail("status code was *not* 201");
    }
  } 
};