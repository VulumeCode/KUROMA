
color red = #ff6188;
color green = #a9dc76;
color yellow = #ffd866;
color orange = #fc9867;
color purple = #ab9df2;
color blue = #78dce8;
//color black = #2c292d;
color black = color(44, 41, 45, 200);
color white = #fcfcfa;
color gray = #908e8f;

void setup() {
  size(360, 640, P3D);
    
  frameRate(60);
}

int[][] map = 
 {
   {0,0,0,4,0,1,1,0,0,0},
   {0,0,0,1,0,1,1,0,0,0},
   {0,0,1,1,4,1,1,0,0,0},
   {0,0,1,1,0,1,4,0,0,0},
   {0,0,0,3,0,1,1,3,0,0},
   {0,0,1,1,0,2,1,0,1,0},
   {0,0,1,3,1,1,1,3,0,0},
   {0,0,0,1,0,1,3,0,0,0},
   {0,0,0,1,1,1,1,0,0,0},
   {0,0,0,1,0,1,1,0,0,0},
 };


int nothing = 0;
int square = 1;
int player = 2;
int reachable = 3;
int passed = 4;


void draw() {    
background(black);
noStroke();
for(int i = 0; i < 10; i++){
  pushMatrix();
  for(int j = 0; j < 10; j++){
    pushMatrix();
    switch (map[i][j]){
      case 0: fill(black); break;
      case 1: fill(yellow); break;
      case 2: fill(green); break;
      case 3: fill(blue); break;
      case 4: fill(red); break;
    }
    translate(j*36,144+i*36);
    int space = 4;
    rect(space,space,36-2*space,36-2*space);
    popMatrix();
  }
  popMatrix();
}
}  