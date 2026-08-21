import{c as a,F as d,S as g,l as o,C as s,d as r,T as e,j as n}from"./index-CofcP5kd.js";import{C as y}from"./clock-BmzF5FQ2.js";/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=a("Circle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=a("FilePen",[["path",{d:"M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5",key:"1couwa"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z",key:"1y4qbx"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=a("Slash",[["path",{d:"M22 2 2 22",key:"y4kqgn"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=a("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]),m={Draft:{icon:p,colorClass:"status-gray"},Confirmed:{icon:s,colorClass:"status-info"},Pending:{icon:y,colorClass:"status-gray"},"In Progress":{icon:i,colorClass:"status-warning"},Completed:{icon:s,colorClass:"status-success"},Cancelled:{icon:o,colorClass:"status-error"},Delayed:{icon:r,colorClass:"status-error"},"Partially Delivered":{icon:e,colorClass:"status-warning"},"Fully Delivered":{icon:s,colorClass:"status-success"},"Partially Received":{icon:e,colorClass:"status-warning"},"Fully Received":{icon:s,colorClass:"status-success"},Healthy:{icon:s,colorClass:"status-success"},"Low Stock":{icon:r,colorClass:"status-warning"},"Out of Stock":{icon:o,colorClass:"status-error"},Active:{icon:s,colorClass:"status-success"},Inactive:{icon:o,colorClass:"status-gray"},"Purchase Created":{icon:g,colorClass:"status-info"},"Manufacturing Created":{icon:d,colorClass:"status-info"},Triggered:{icon:k,colorClass:"status-warning"},Skipped:{icon:h,colorClass:"status-gray"}},w=({status:c,variant:l})=>{const t=m[c]||{icon:i,colorClass:"status-gray"},u=t.icon,C=l?`status-${l}`:t.colorClass;return n.jsxs("span",{className:`status-badge ${C}`,children:[n.jsx(u,{className:"w-3 h-3 mr-1.5"}),c]})};export{w as S};
