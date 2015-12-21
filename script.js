// variables globales

var lienzo = document.getElementById("lienzo");
var pluma = lienzo.getContext("2d");
var mats = [];
var maps = [];
var indivs = [];
var n_indivs = 10;
var p_mutacion = 10;
var color1 = [5, 255, 100];
var color2 = [200, 10, 20];
var color3 = [200, 5, 180];
var pausa = false;
var a = 10;
var b = 10;
var dens = 8;
var borde = 20;
var gen = 0;
var numbers = [];
var scores = [];
var time = 0;
var timeInterval = 300;

// funciones generadoras de los principales objetos

function randAdn(){
	adn = [];
	for (var ii=0; ii<4; ii++){
		adn[ii]=[];
		for (var jj=0; jj<4; jj++){
			adn[ii][jj]=[];
			for (var kk=0; kk<4; kk++){
				adn[ii][jj][kk]=[];
				for (var ll=0; ll<4; ll++){
					adn[ii][jj][kk][ll] = (2*Math.random() > 1);
				}
			}
		}
	}
	return adn;
}

function resetbacteria(){
	for (var hh=0; hh<n_indivs; hh++){
		indivs[hh] = [randAdn(), randAdn()];
		numbers[hh] = hh;
		scores[hh] = [];
	}
}

function resetmaps(){
	for (var hh=0; hh<n_indivs; hh++){
		maps[hh] = [];
		for (var ii=0; ii<a; ii++){
			maps[hh][ii] = [];
			for (var jj=0; jj<b; jj++){
				maps[hh][ii][jj] = true;
			}
		}
	}
}

function resetboards(){
	for (var hh=0; hh<n_indivs; hh++){
		mats[hh] = [];
		for (var ii=0; ii<a; ii++){
			mats[hh][ii]=[];
			for (var jj=0; jj<b; jj++){
				r = 2*Math.random();
				mats[hh][ii][jj] = parseInt(r);
			}
		}
		mats[hh][a/2][b/2] = 3;
		mats[hh][a/2 - 1][b/2] = 3;
		mats[hh][a/2 - 1][b/2 - 1] = 3;
		mats[hh][a/2][b/2 - 1] = 3;
		x0 = (2*dens*a + borde)*(hh%(n_indivs/2));
		y0 = (2*dens*b + borde)*(parseInt(hh*2/n_indivs) + 1);
		pluma.fillStyle = "white";
		pluma.fillRect(x0, y0, 60, 30);
		pluma.fillStyle = "black";
		pluma.fillText(numbers[hh], borde + x0, borde + y0 - 5);
	}
}

// funciones auxiliares para los graficos

function prod(lis, k){
	for (var ii=0; ii<3; ii++){
		lis[ii] = parseInt(lis[ii]*k);
	}
	return lis;
}

function randcol(){
	var lis = [parseInt(Math.random()*4)*85, parseInt(Math.random()*4)*85, parseInt(Math.random()*4)*85];
	if (lis[0] + lis[1] + lis[2]==0){
		return randcol();
	}
	return lis;
}

function rgbstr(lis){
	return "rgb(" + lis[0] + "," + lis[1] + "," + lis[2] + ")";
}

function square(p, q, d, c){
	pluma.fillStyle = c;
	pluma.fillRect(p - d, q - d, 1, 2*d);
	pluma.fillRect(p - d, q + d, 2*d, 1);
	pluma.fillRect(p - d + 1, q - d, 2*d, 1);
	pluma.fillRect(p + d, q - d + 1, 1, 2*d);
}

function block(p, q, d, c){
	for (var tt=0; tt<4; tt++){
		square(p, q, d - tt, rgbstr(prod([c[0], c[1], c[2]], tt*(32 - 5*tt)/51.0)));
	}
	pluma.fillStyle = rgbstr([c[0], c[1], c[2]]);
	pluma.fillRect(p - d + 4, q - d + 4, 2*d - 7, 2*d - 7);
}

// funciones especificas para los graficos

function fulldraw(ind){
	x0 = borde + dens + (2*dens*a + borde)*(ind%(n_indivs/2));
	y0 = borde + dens + (2*dens*b + borde)*(parseInt(ind*2.0/n_indivs));
	for (var ii=0; ii<a; ii++){
		for (var jj=0; jj<b; jj++){
			if (mats[ind][ii][jj] == 1){
				block(x0 + dens*2*ii, y0 + 2*dens*jj, dens, color1);
			}
			if (mats[ind][ii][jj] == 2){
				block(x0 + dens*2*ii, y0 + 2*dens*jj, dens, color2);
			}
			if (mats[ind][ii][jj] == 3){
				block(x0 + dens*2*ii, y0 + 2*dens*jj, dens, color3);
			}
			if (mats[ind][ii][jj] == 0){
				pluma.fillStyle = "black";
				pluma.fillRect(x0 - dens + 2*dens*ii, y0 - dens + 2*dens*jj, 2*dens, 2*dens);
			}
		}
	}
}

function draw(){
	for (var ii=0; ii<n_indivs; ii++){
		fulldraw(ii);
	}
}

function drawAdn(ind){
	var y0 = 3*borde + dens + 2*dens*b*2;
	pluma.fillStyle = "black";
	for (var hh=0; hh<2; hh++){
		for (var ii=0; ii<4; ii++){
			for (var jj=0; jj<4; jj++){
				for (var kk=0; kk<4; kk++){
					for (var ll=0; ll<4; ll++){
						if (indivs[ind][hh][ii][jj][kk][ll]){
							pluma.fillRect(40*hh + 4*ii + jj, y0 + 4*kk + ll, 1, 1);
						}
					}
				}
			}
		}
	}
}

// funciones del mecanismo de la simulacion

function calcula(ind, x1, y1, x2, y2){
	var action = mats[ind][x1][y1];
	var top = mats[ind][x2][y2];
	if (action < 2 && top < 2){
		return (Math.random()*2 > 1);
	}
	if (action < 2 && top > 1){
		return true;
	}
	var bottom = mats[ind][(2*x1 - x2 + a)%a][(2*y1 - y2 + b)%b];
	var right = mats[ind][(x1 + y2 - y1 + a)%a][(y1 + x1 - x2 + b)%b];
	var left = mats[ind][(x1 - y2 + y1 + a)%a][(y1 + x2 - x1 + b)%b];
	return indivs[ind][action - 2][top][bottom][right][left];
}

function procesa(act, obj){
	if (act == 2){
		if (obj == 1){
			return [3, 0];
		}
		if (obj == 0){
			return [0, 2];
		}
		if (obj == 3){
			return [3, 2];
		}
		if (obj == 2){
			return [3, 1];
		}
	}
	if (act == 3){
		if (obj == 1){
			return [2, 2];
		}
		if (obj == 0){
			return [2, 1];
		}
		if (obj == 3){
			return [3, 3];
		}
		if (obj == 2){
			return [2, 3];
		}
	}
	if (act == 1 && obj == 0){
		return [0, 1];
	}
	if (act == 0 && obj == 1){
		return [1, 0];
	}
	return [act, obj];
}

function mover(ind){
	var moves = [];
	var count = 0;
	resetmaps();
	for (var tt=0; tt<a*b/2; tt++){
		var xr = parseInt(a*Math.random());
		var yr = parseInt(b*Math.random());
		if (maps[ind][xr][yr]){
			var b1 = Math.random()*2 > 1;
			var b2 = parseInt(Math.random()*2)*2 - 1;
			var xn, yn;
			if (b1){
				xn = (a + xr + b2)%a;
				yn = yr;
			} else {
				xn = xr;
				yn = (yr + b2 + b)%b;
			}
			if (maps[ind][xn][yn]){
				maps[ind][xn][yn] = false;
				maps[ind][xr][yr] = false;
				moves[count] = [xr, yr, xn, yn];
				count++;
			}
		}
	}
	for (var ii=0; ii<count; ii++){
		if (calcula(ind, moves[ii][0], moves[ii][1], moves[ii][2], moves[ii][3])){
			var p = procesa(mats[ind][moves[ii][0]][moves[ii][1]], mats[ind][moves[ii][2]][moves[ii][3]]);
			mats[ind][moves[ii][0]][moves[ii][1]] = p[0];
			mats[ind][moves[ii][2]][moves[ii][3]] = p[1];
		}
	}
}

function avanzar(){
	for (var hh=0; hh<n_indivs; hh++){
		mover(hh);
	}
	draw();
}

// funciones del algoritmo genetico

function mezclar(i1, i2){
	var adn = [];
	for (var ii=0; ii<4; ii++){
		adn[ii]=[];
		for (var jj=0; jj<4; jj++){
			adn[ii][jj]=[];
			for (var kk=0; kk<4; kk++){
				adn[ii][jj][kk]=[];
				for (var ll=0; ll<4; ll++){
					var rand = (2*Math.random() > 1);
					if (rand){
						adn[ii][jj][kk][ll] = i1[ii][jj][kk][ll];
					} else {
						adn[ii][jj][kk][ll] = i2[ii][jj][kk][ll];
					}
					if (Math.random()*p_mutacion<1){
						adn[ii][jj][kk][ll] = !adn[ii][jj][kk][ll];
					}
				}
			}
		}
	}
	return adn;
}

function cortar(i1, i2){
	rand1 = parseInt(Math.random()*256);
	var adn = [];
	for (var ii=0; ii<4; ii++){
		adn[ii]=[];
		for (var jj=0; jj<4; jj++){
			adn[ii][jj]=[];
			for (var kk=0; kk<4; kk++){
				adn[ii][jj][kk]=[];
				for (var ll=0; ll<4; ll++){
					if (64*ii + 16*jj + 4*kk + ll >rand1){
						adn[ii][jj][kk][ll] = i1[ii][jj][kk][ll];
					} else {
						adn[ii][jj][kk][ll] = i2[ii][jj][kk][ll];
					}
				}
			}
		}
	}
	return adn;
}

function contar(ind){
	var res = 0;
	for (var ii=0; ii<a; ii++){
		for (var jj=0; jj<b; jj++){
			if (mats[ind][ii][jj] > 1){
				res++;
			}
		}
	}
	return res;
}

function evalua(){
	var lis = [];
	for (var hh=0; hh<n_indivs; hh++){
		scores[hh][scores[hh].length] = contar(hh);
		lis[hh] = contar(hh);
	}
	return lis;
}

function media(lista){
	var tot = 0;
	for (var ind=0; ind<lista.length; ind++){
		tot = tot + lista[ind];
	}
	return (tot + 0.0)/lista.length;
}

function evolution(){
	var lis = evalua();
	console.log(lis, media(lis));
	for (var hh=0; hh<n_indivs; hh++){
		lis[hh] = media(scores[hh])// + Math.log(scores[hh].length);
	}
	indices = [];
	nums = [];
	new_scores = [];
	for (var tt=0; tt<n_indivs/2; tt++){
		var max = 0;
		var pos = 0;
		for (var ii = 0; ii<n_indivs; ii++){
			if (lis[ii]>max){
				max = lis[ii];
				pos = ii;
			}
		}
		new_scores[tt] = [];
		for (var hh=0; hh<scores[pos].length; hh++){
			new_scores[tt][hh] = scores[pos][hh];
		}
		indices[tt] = [];
		for (var hh=0; hh<2; hh++){
			indices[tt][hh] = [];
			for (var ii=0; ii<4; ii++){
				indices[tt][hh][ii] = [];
				for (var jj=0; jj<4; jj++){
					indices[tt][hh][ii][jj] = [];
					for (var kk=0; kk<4; kk++){
						indices[tt][hh][ii][jj][kk] = [];
						for (var ll=0; ll<4; ll++){
							indices[tt][hh][ii][jj][kk][ll] = indivs[pos];
						}
					}
				}
			}
		}
		nums[tt] = numbers[pos];
		lis[pos] = -1;
	}
	for (var tt=0; tt<n_indivs/2; tt++){
		numbers[tt] = nums[tt];
		scores[tt] = [];
		for (var hh=0; hh<new_scores[tt].length; hh++){
			scores[tt][hh] = new_scores[tt][hh];
		}
		for (var hh=0; hh<2; hh++){
			for (var ii=0; ii<4; ii++){
				for (var jj=0; jj<4; jj++){
					for (var kk=0; kk<4; kk++){
						for (var ll=0; ll<4; ll++){
							indivs[tt][hh][ii][jj][kk][ll] = indices[tt][hh][ii][jj][kk][ll];
						}
					}
				}
			}
		}
	}
	for (var tt=0; tt<n_indivs/2; tt++){
		var aux = (tt + 1)%(n_indivs/2);
		indivs[tt + n_indivs/2] = [mezclar(indices[tt][0], indices[aux][0]), mezclar(indices[tt][1], indices[aux][1])];
		numbers[tt + n_indivs/2] = n_indivs/2*(gen + 1) + tt;
		scores[tt + n_indivs/2] = [];
	}
}

// funciones para ejecutar desde el html

function comenzar(){
	resetbacteria();
	resetboards();
}

function revisar(){
	if (!pausa){
		avanzar();
		time++;
		document.getElementById("messages").innerHTML = "Tiempo: " + time + ".    Generacion: " + gen;
		if (time == timeInterval){
			time = 0;
			gen++;
			evolution();
			resetboards();
			draw();
		}
	}
}


comenzar();

window.setInterval(revisar, 10);
