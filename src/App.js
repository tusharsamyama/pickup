import React, { Component } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
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

  componentWillMount() {
    this.setState({
      racks : [
        [{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:4,y:1},{x:5,y:1}],
        [{x:1,y:4},{x:2,y:4},{x:3,y:4},{x:4,y:4},{x:5,y:4}],
        [{x:1,y:5},{x:2,y:5},{x:3,y:5},{x:4,y:5},{x:5,y:5}],
        [{x:1,y:8},{x:2,y:8},{x:3,y:8},{x:4,y:8},{x:5,y:8}]
      ]
    });
    axios.get('')
  }

  componentDidMount() {
    this.init();
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
    const { ctx } = this.state;
    ctx.clearRect(0, 0, 500, 500);
    setTimeout(this.drawRect(ctx),100);
  }

  clickHandler(e,c) {
    const { size, ctx, selected } = this.state;
    const elemLeft = c.offsetLeft;
    const elemTop = c.offsetTop;
    const canvasX = e.pageX-elemLeft;
    const canvasY = e.pageY-elemTop;
    const rackPosX = Math.floor(canvasX/50)*size;
    const rackPosY = Math.floor(canvasY/50)*size;
    const hashVal = rackPosX+"_"+rackPosY;
    if(selected[hashVal]) {
      if(selected[hashVal].isSelected){
        ctx.clearRect(rackPosX+1,rackPosY+1,size-4,size-18);
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

    const { size, racks, selected } = this.state, hash = {};    
    racks.map((rack)=>{
      rack.map((box) => {
        const xp = box.x*size;
        const yp = box.y*size;
        ctx.rect(box.x*size,box.y*size,size,size);
        //ctx.font = "15px Arial";
        //ctx.fillText(box.x+':'+box.y,box.x*size+5,box.y*size+(size - 5) );
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

        
    // for(var i = 0; i < points.length; i ++){
    //   ctx.beginPath();
    //   points[i].isPick && ctx.arc(points[i].x,points[i].y,10,0,2*Math.PI);
    //   ctx.stroke();
    // }

  }

  render() {
    return (
      <div>
        <div className="heading"><h1>Shortest Pickup Path</h1></div>
        <div className="actionBar">
          <input placeholder="Enter order number" type="text" ref={(node) => { this.orderNo = node;}} />
          <button onClick={() => { this.drawPath() }}>Show</button>
          <button onClick={() => { this.clear() }}>Clear</button>
        </div>

        <div>
          <canvas id="myCanvas" width="1000" height="2000" style={{border:'1px solid #d3d3d3'}} />
        </div>
      </div>
    );
  }
}

export default App;
