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
      selectedRackIds:[],
      orderNo:'',
      racks:[],
      path:[]
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
    
    // racks = rackList.map((rack)=>{
    //   const blocks = [];
    //   for(var i = rack.x; i<rack.x + rack.size;i++){
    //     blocks.push({ 
    //       'x': i, 
    //       'y': rack.y
    //     });
    //   }
    //   return blocks;
    // });

    axios.get('https://frozen-cove-59828.herokuapp.com/warehouse/path').then((result)=>{
      const rackIds = Object.keys(result.data.racks);
      const racks = rackIds.map((id) => {
        const rack = result.data.racks[id];
        return {
          x: rack.x,
          y: rack.y,
          id: id
        }
      });

      that.setState({
        racks : racks
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
    const { size, ctx, selected, selectedRackIds } = this.state;
    const elemLeft = c.offsetLeft;
    const elemTop = c.offsetTop;
    const canvasX = e.pageX-elemLeft;
    const canvasY = e.pageY-elemTop;
    
    const rackPosX = Math.floor(canvasX/size)*size;
    const rackPosY = Math.floor(canvasY/size)*size;
    //console.log(rackPosX,rackPosY);

    const hashVal = rackPosX+"_"+rackPosY;
    if(selected[hashVal]) {
      if(selected[hashVal].isSelected){
        ctx.clearRect(rackPosX+2,rackPosY+2,size-4,size-20);
        const newCell = Object.assign({},selected[hashVal],{isSelected: false});
        
        const idx = selectedRackIds.findIndex((e) => {
          e.id == selected[hashVal].id;
        });

        selectedRackIds.splice(idx,1);
        
        this.setState({
          selected: Object.assign({},selected,{ [hashVal] : newCell }),
          selectedRackIds: [...selectedRackIds]
        });

      } else {        
        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.arc(rackPosX+size/2,rackPosY+size/2,6,0,2*Math.PI);
        ctx.fill();
        const newCell = Object.assign({},selected[hashVal],{isSelected: true});
        this.setState({
          selected: Object.assign({},selected,{ [hashVal] : newCell }),
          selectedRackIds: [...selectedRackIds,selected[hashVal].id]
        });
      }
    }
  }

  drawRect(ctx) {
    //alert('here..');
    ctx.lineWidth = 1;
    const { size, racks, selected } = this.state, hash = {};

    racks.map((box)=>{
      const xp = box.x*size;
      const yp = box.y*size;
      ctx.rect(box.x*size,box.y*size,size,size);
      ctx.font = "15px Arial";
      ctx.fillText(box.id,box.x*size+5,box.y*size+(size - 5) );
      const hashVal = xp+"_"+yp;
      hash[hashVal] = {x:xp,y:yp,id:box.id};
    });

    this.setState({
      selected: Object.assign({},hash)
    });

    ctx.stroke();
    //console.log('>>>',hash);
  }

  drawPath() {
    const { selected, selectedRackIds } = this.state;
    const that = this;
    //console.log('selectedRackIds',selectedRackIds);
    const queryParams = selectedRackIds.map((id) => { return 'racks='+id }).join('&');
    axios.get('https://frozen-cove-59828.herokuapp.com/warehouse/path?'+queryParams)
    .then((result)=>{
      //console.log('result.data.path',result.data.path);
      const { ctx, size } = that.state;
      const path = result.data.path;
      
      ctx.lineWidth = 3;
      const points = path.map((pt)=>{
        return {
          x: (pt.x*size) + (size/2),
          y: (pt.y*size) + (size/2),
          counter: pt.counter
        }
      });

      ctx.beginPath();
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

        if(points[i].counter) {
          //console.log('points[i]',points[i],points[i].x*size+2,points[i].y*size+2);
          ctx.font = "15xpx Arial";
          ctx.fillText(points[i].counter,points[i].x,points[i].y-7);
        }
      }
      ctx.stroke();
      
      this.setState({
        isClickable: false
      })

      ctx.beginPath();
      ctx.arc(points[0].x,points[0].y,6,0,2*Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.stroke();

    });
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
          <span>Select the racks to find path :) </span>
          <button 
            disabled={!this.state.isClickable || this.state.selectedRackIds.length < 1} 
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
          <canvas id="myCanvas" width="1500" height="2600" />
        </div>

      </div>
    );
  }
}

export default App;
