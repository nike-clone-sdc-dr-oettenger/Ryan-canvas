import http from "k6/http";
import { check, fail } from "k6";


export let options = {
  throw: true,

}


export default function() {
  let shoe_id = Math.floor(Math.random() * 10000000)
  let res = http.get(`http://127.0.0.1:1121/api/images?shoe_id=${shoe_id}`);
  if (!check(res, {
    "status code MUST be 200": (res) => res.status == 200,
  })) {
    fail("status code was *not* 200");
  }
};