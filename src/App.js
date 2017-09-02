import React, { Component } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

const rackList = [
{x:1,y:1,size:10},
{x:1,y:4,size:10},
{x:1,y:5,size:10},
{x:1,y:8,size:10},
{x:1,y:9,size:10},
{x:1,y:12,size:10},

{x:13,y:1,size:10},
{x:13,y:4,size:10},
{x:13,y:5,size:10},
{x:13,y:8,size:10},
{x:13,y:9,size:10},
{x:13,y:12,size:10},
];

class App extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      isClickable:true,
      size:50,
      elem:null,
      ctx:null,
      selected:{},
      orderNo:'',
      racks:[],
      path:[{x:1,y:1,isPick:true},{x:1,y:3},{x:0,y:3},{x:0,y:6},{x:2,y:6},{x:2,y:5,isPick:true},{x:2,y:6},{x:5,y:6},{x:5,y:8,isPick:true}]
    }

    this.init = this.init.bind(this);
    this.drawRect = this.drawRect.bind(this);
    this.drawPath = this.drawPath.bind(this);
    this.clickHandler = this.clickHandler.bind(this);
    this.clear = this.clear.bind(this);
  }

  componentDidMount() {
    const that = this;
    let racks = [];
    
    racks = rackList.map((rack)=>{
      const blocks = [];
      for(var i = rack.x; i<rack.x + rack.size;i++){
        blocks.push({ 
          'x': i, 
          'y': rack.y
        });
      }
      return blocks;
    });

    axios.get('https://jsonplaceholder.typicode.com/users').then((result)=>{
      that.setState({
        racks : racks
        // racks : [
        //   [{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:4,y:1},{x:5,y:1}],
        //   [{x:1,y:4},{x:2,y:4},{x:3,y:4},{x:4,y:4},{x:5,y:4}],
        //   [{x:1,y:5},{x:2,y:5},{x:3,y:5},{x:4,y:5},{x:5,y:5}],
        //   [{x:1,y:8},{x:2,y:8},{x:3,y:8},{x:4,y:8},{x:5,y:8}],
        //   [{x:11,y:1},{x:12,y:1},{x:13,y:1},{x:14,y:1},{x:15,y:1}],
        //   [{x:11,y:4},{x:12,y:4},{x:13,y:4},{x:14,y:4},{x:15,y:4}],
        //   [{x:11,y:5},{x:12,y:5},{x:13,y:5},{x:14,y:5},{x:15,y:5}],
        //   [{x:11,y:8},{x:12,y:8},{x:13,y:8},{x:14,y:8},{x:15,y:8}]
        // ]
      });  
    }).then(() => {
      this.init();      
    });
  }

  init() {
    var c = document.getElementById("myCanvas");
    c.addEventListener('click',(e) => { this.clickHandler(e,c); } );
    var ctx=c.getContext("2d");
    this.setState({
      ctx: ctx,
      elem: c,
    });
    this.drawRect(ctx);
    //  alert('init done');
  }

  clear() {
    window.location.reload();
  }

  clickHandler(e,c) {
    if(!this.state.isClickable)
      return;
    const { size, ctx, selected } = this.state;
    const elemLeft = c.offsetLeft;
    const elemTop = c.offsetTop;
    const canvasX = e.pageX-elemLeft;
    const canvasY = e.pageY-elemTop;
    const rackPosX = Math.floor(canvasX/size)*size;
    const rackPosY = Math.floor(canvasY/size)*size;
    const hashVal = rackPosX+"_"+rackPosY;
    if(selected[hashVal]) {
      if(selected[hashVal].isSelected){
        ctx.clearRect(rackPosX+2,rackPosY+2,size-4,size-4);
        const newCell = Object.assign({},selected[hashVal],{isSelected: false});
        this.setState({
          selected: Object.assign({},selected,{ [hashVal] : newCell })
        });
      } else {        
        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.arc(rackPosX+size/2,rackPosY+size/2,6,0,2*Math.PI);
        ctx.fill();
        const newCell = Object.assign({},selected[hashVal],{isSelected: true});
        this.setState({
          selected: Object.assign({},selected,{ [hashVal] : newCell })
        });
      }
    }
  }

  drawRect(ctx) {
    //alert('here..');
    ctx.lineWidth = 1;
    const { size, racks, selected } = this.state, hash = {};    
    racks.map((rack)=>{
      rack.map((box) => {
        const xp = box.x*size;
        const yp = box.y*size;
        ctx.rect(box.x*size,box.y*size,size,size);
        ctx.font = "15px Arial";
        ctx.fillText(box.x+':'+box.y,box.x*size+5,box.y*size+(size - 5) );
        const hashVal = xp+"_"+yp;
        hash[hashVal] = {x:xp,y:yp};
      })
    });

    this.setState({
      selected: Object.assign({},hash)
    });

    ctx.stroke();
  }

  drawPath() {

    const { path, ctx, size } = this.state;
    ctx.beginPath();
    ctx.lineWidth = 3;
    const points = path.map((pt)=>{
      return {
        x: (pt.x*size) + (size/2),
        y: (pt.y*size) + (size/2),
        isPick: pt.isPick
      }
    });
    
    ctx.moveTo((points[0].x), points[0].y);
    for(var i = 0; i < points.length-1; i ++)
    { 
      var x_mid = (points[i].x + points[i+1].x) / 2;
      var y_mid = (points[i].y + points[i+1].y) / 2;
      var cp_x1 = (x_mid + points[i].x) / 2;
      var cp_y1 = (y_mid + points[i].y) / 2;
      var cp_x2 = (x_mid + points[i+1].x) / 2;
      var cp_y2 = (y_mid + points[i+1].y) / 2;
      ctx.quadraticCurveTo(cp_x1,points[i].y ,x_mid, y_mid);
      ctx.quadraticCurveTo(cp_x2,points[i+1].y ,points[i+1].x,points[i+1].y);
    }
    ctx.stroke();

    this.setState({
      isClickable: false
    })

  }

  render() {
    return (
      <div>

        <div className="heading">  
          <div className="headPart">
            <img className="logo" src="http://pharmeasy.in/dist/cba0bc934de5d4434a4a491af1a524bd.png" />
          </div>
        </div>
        
        <div className="actionBar">
          
          <input 
            disabled={!this.state.isClickable} 
            placeholder="Enter order number" 
            type="text" 
            ref={(node) => { this.orderNo = node;}} 
          />

          <button 
            disabled={!this.state.isClickable} 
            onClick={() => { this.drawPath() }}>
            Show Path
          </button>

          <button 
            disabled={this.state.isClickable} 
            onClick={() => { this.clear() }}>
            Next Order
          </button>
        </div>

        <div className="canvasContainer">
          <canvas id="myCanvas" width="1400" height="1000" style={{border:'1px solid #000'}} />
        </div>

      </div>
    );
  }
}

export default App;
