// Restore intermediate versions from the recorded geometry. Existing snapshots stay intact.
const fs=require('node:fs'),path=require('node:path');
const {PNG}=require(process.env.PNGJS_MODULE||'pngjs');
const root=path.resolve(__dirname,'..');
const versions=JSON.parse(fs.readFileSync(path.join(root,'versions.json')));
for(const v of versions.filter(v=>v.n>1))for(const dark of [false,true])for(const size of [16,32,512]){
 const suffix=(size===512?'':`-${size}`)+(dark?'-dark':'');
 const output=path.join(root,`${v.n}${suffix}.png`);
 if(fs.existsSync(output))continue;
 const png=new PNG({width:size,height:size});
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 let visible=0,channels=[0,0,0];
 for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++){
 const px=(x+(sx+.5)/4)*64/size,py=(y+(sy+.5)/4)*64/size;
 const inCircle=(cx,cy,r)=>(px-cx)**2+(py-cy)**2<=r*r;
 let color=null;
 if(v.background==='square'||v.background==='circle'&&inCircle(32,32,31))color=[255,255,255];
 if(inCircle(v.x,v.y,v.r))color=dark?[170,165,255]:[99,91,219];
 if(v.orange){if(v.border&&inCircle(41,41,v.orange+v.border))color=[255,255,255];if(inCircle(41,41,v.orange))color=dark?[227,153,98]:[198,108,50];}
 if(color){visible++;for(let c=0;c<3;c++)channels[c]+=color[c];}
 }
 const i=(y*size+x)*4;for(let c=0;c<3;c++)png.data[i+c]=visible?Math.round(channels[c]/visible):0;png.data[i+3]=Math.round(255*visible/16);
 }
 fs.writeFileSync(output,PNG.sync.write(png));
 }
