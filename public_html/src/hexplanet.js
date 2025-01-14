//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, scene, renderer;

var mesh, group1, group2, group3, light;

const mouse = new THREE.Vector2();

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var mouse2D,projector;

var clock = new THREE.Clock();

var gui, guiConfig;

var g_light;

var g_hexoplanetGeometry;

var hexoplanetGeometry;

init();
animate();



var g_HexPlanetData;

function init() {

    container = document.getElementById( 'container' );

    //perspetiva da camara
    camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1800;

   //controls = new THREE.OrbitControls( camera );
   //cria a cena
    scene = new THREE.Scene();

    //cria a luz
    g_light = new THREE.DirectionalLight( 0xffffff );
    g_light.position.set( 0, 0, 1 );
    scene.add( g_light );

    var ambientLight = new THREE.AmbientLight( 0xffffff );
    scene.add( ambientLight );
    // shadow

    var iNumSubdivisions = 3;
    var image = new Image();

//   image.onload = function () {
//     texture.needsUpdate = true;
//   };
//   image.src = "textures/hextileprueba.png";
//   var texture = new THREE.Texture(
//     image,
//     new THREE.UVMapping(),
//     THREE.ClampToEdgeWrapping,
//     THREE.ClampToEdgeWrapping,
//     THREE.NearestFilter,
//     THREE.LinearMipMapLinearFilter
//   );
  
    //var g_material11 = new THREE.MeshLambertMaterial( {  map: texture, ambient: 0xbbbbbb , vertexColors: THREE.VertexColors });
    //var g_material10 = new THREE.MeshLambertMaterial( {  map: texture, ambient: 0xbbbbbb });
    //var g_material01 = new THREE.MeshLambertMaterial( {  ambient: 0xbbbbbb , vertexColors: THREE.VertexColors });
    //var g_material00 = new THREE.MeshLambertMaterial( {  ambient: 0xbbbbbb});

    //cria a mesh

    var g_material11 = new THREE.MeshToonMaterial({ color: 0x112233, ambient: 0x00ffff });

    mouse2D = new THREE.Vector3( 0, 10000, 0.5 );
    //projector = new THREE.Projector();

    //hexoplanetGeometry.mergeVertices();
    
    //cria a geometria
    g_hexoplanetGeometry = createHexSphere(iNumSubdivisions);
    mesh = new THREE.Mesh( g_hexoplanetGeometry, g_material11 );
    mesh.position.y = 0;
    mesh.position.x = 0;
    scene.add( mesh );	
    
    //cria os limites de cada hexa e pentagono
    var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: 0xff0000,wireframe   : true } );
    var outlineMesh1 = new THREE.Mesh( g_hexoplanetGeometry, outlineMaterial1 );

    scene.add( outlineMesh1 );

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );

    container.appendChild( renderer.domElement );

    // stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.top = '0px';
    // container.appendChild( stats.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );

    //

    window.addEventListener( 'resize', onWindowResize, false );

    // ----------------------------------
    // GUI
    // ----------------------------------
            
}

// function generateLabelMaterial( text ) 


function perpendicular( vector )
{
   // static const Real fSquareZero = (Real)(1e-06 * 1e-06);

    var UNIT_X = new THREE.Vector3(1,0,0);
    var UNIT_Y = new THREE.Vector3(0,1,0);
    var perp = vector.clone();
    // perp = perp.crossSelf( UNIT_X );
     perp = perp.cross( UNIT_X );

    // Check length
    if( perp.lengthSq() < 0.01 )
    {
        // This vector is the Y axis multiplied by a scalar, so we have
        //   to use another axis.
        perp = vector.clone();
        //perp = perp.crossSelf( UNIT_Y );
        perp = perp.cross( UNIT_Y );
    }

    return perp;
}


function HexData () {
    this.aFaces = new Array();
    this.aTopFaces = new Array();
    this.iCenterId = 0;
    this.vCenter =  new THREE.Vector3(0,0,0);
    this.aNeighbors= new Array();
    this.fHeight = 100.0;
}


function createHexSphere(iNumSubdiv)
{
    var faceIndices = [ 'a', 'b', 'c', 'd' ];

    var color, f, f2, f3, p, n, vertexIndex;

    var radius = 100.0;				

    hexoplanetGeometry =  new THREE.IcosahedronGeometry( radius, 0 );
    
    // var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: 0xff0000,wireframe   : true } );
    // var outlineMesh1 = new THREE.Mesh( hexoplanetGeometry, outlineMaterial1 );

    // scene.add( outlineMesh1 );

    hexoplanetGeometry.dynamic = true;
    

    for(var pataticas = 0; pataticas < iNumSubdiv; pataticas++)
    {

        var aNeighborsInfo  = new Array();
        g_HexPlanetData = new Array();

        //hexoplanetGeometry.attributes.normal.count
        for ( var i = 0; i < hexoplanetGeometry.faces.length; i ++ )
        {
            f  = hexoplanetGeometry.faces[ i ];
            n = ( f instanceof THREE.Face3 ) ? 3 : 4;

            var centerVertex = new THREE.Vector3(0,0,0);
            var aCurrentVertexID  = new Array();

            for( var j = 0; j < n; j++ )
            {
                vertexIndex = f[ faceIndices[ j ] ];
                p = hexoplanetGeometry.vertices[ vertexIndex ];
                //centerVertex.addSelf(p);
                centerVertex.add(p);

                aCurrentVertexID.push(vertexIndex);
            }

            centerVertex.divideScalar( n );

            hexoplanetGeometry.vertices.push(centerVertex);

            //Store neighbords info
            for(var id = 0; id < aCurrentVertexID.length; id++)
            {	

                var directionVector = hexoplanetGeometry.vertices[0].clone();
                directionVector = perpendicular(directionVector);

                //var v1 = directionVector.subSelf(hexoplanetGeometry.vertices[ aCurrentVertexID[id] ]);
                var v1 = directionVector.sub(hexoplanetGeometry.vertices[ aCurrentVertexID[id] ]);		
                var nrm = centerVertex.clone();
                var v2 = centerVertex.clone();
                //v2 = v2.subSelf(hexoplanetGeometry.vertices[ aCurrentVertexID[id] ]);	
                v2 = v2.sub(hexoplanetGeometry.vertices[ aCurrentVertexID[id] ]);			
                nrm = nrm.normalize();
                v1 = v1.normalize();
                v2 = v2.normalize();

                var angle = Math.acos( v1.dot( v2 ) );
                //var dir = nrm.dot( v1.crossSelf( v2 ) );
                var dir = nrm.dot( v1.cross( v2 ) );
                if (dir < 0.0) angle = 3.14 + (3.14 - angle);

                if(aNeighborsInfo[aCurrentVertexID[id]] == undefined) aNeighborsInfo[aCurrentVertexID[id]] = new Array();

                var neighbordsObject = new Object();
                neighbordsObject.vertexID = hexoplanetGeometry.vertices.length - 1;
                neighbordsObject.angle = angle;
                aNeighborsInfo[aCurrentVertexID[id]].push(neighbordsObject);
            }

        }

        for ( var i = 0; i < hexoplanetGeometry.vertices.length; i ++ )
        {
            hexoplanetGeometry.vertices[i].normalize();
            hexoplanetGeometry.vertices[i].multiplyScalar(radius);
        }

        hexoplanetGeometry.faces.splice(0, hexoplanetGeometry.faces.length);	
        var colorrrrr = 0;
        for ( var i = 0; i < aNeighborsInfo.length; i ++ ) 
        {
            aNeighborsInfo[i].sort(function(a,b){return a.angle > b.angle})
            colorrrrr+=1/aNeighborsInfo.length;
            var random_length = radius + Math.random()*50.0;
            
            var pCurrentHexData = new HexData;
            pCurrentHexData.fHeight = random_length;						
            pCurrentHexData.iCenterId = i;
            pCurrentHexData.vCenter =  hexoplanetGeometry.vertices[i];

            for ( var j = 0; j < aNeighborsInfo[i].length; j ++ ) 
            {
                if (pataticas < (iNumSubdiv - 1) )
                {
                    pCurrentHexData.aFaces.push(hexoplanetGeometry.faces.length);
                    pCurrentHexData.aTopFaces.push(hexoplanetGeometry.faces.length);
                    
                    var newFace = new THREE.Face3(i,aNeighborsInfo[i][j].vertexID,aNeighborsInfo[i][(j + 1) % aNeighborsInfo[i].length].vertexID);

                    color = new THREE.Color( 0xffffff );
                    //color.setHSV( colorrrrr, 1.0, 1.0 );
                    color.setHSL( colorrrrr, 1.0, 1.0 );

                    newFace.vertexColors[ 0 ] = color;
                    newFace.vertexColors[ 1 ] = color;
                    newFace.vertexColors[ 2 ] = color;
                    hexoplanetGeometry.faces.push(newFace);

                    // hexoplanetGeometry.faceVertexUvs[ 0 ].push( [
                    //         new THREE.UV( 0.5, 1 ),
                    //         new THREE.UV(0, 0 ),
                    //         new THREE.UV( 1, 0 )
                    //     ] ); 
                }
                else
                {
                    
                    var vert1 = hexoplanetGeometry.vertices[i].clone();
                    vert1.normalize();
                    vert1.multiplyScalar(random_length);
                    var vert2 = hexoplanetGeometry.vertices[aNeighborsInfo[i][j].vertexID].clone();
                    vert2.normalize();
                    vert2.multiplyScalar(random_length);
                    var vert3 = hexoplanetGeometry.vertices[aNeighborsInfo[i][(j + 1) % aNeighborsInfo[i].length].vertexID].clone();
                    vert3.normalize();
                    vert3.multiplyScalar(random_length);

                    hexoplanetGeometry.vertices.push(vert1);
                    hexoplanetGeometry.vertices.push(vert2);
                    hexoplanetGeometry.vertices.push(vert3);

                    //TOP
                    pCurrentHexData.aFaces.push(hexoplanetGeometry.faces.length);
                    pCurrentHexData.aTopFaces.push(hexoplanetGeometry.faces.length);
                    var newFace2 = new THREE.Face3(hexoplanetGeometry.vertices.length - 3,hexoplanetGeometry.vertices.length - 2,hexoplanetGeometry.vertices.length - 1);
                    color2 = new THREE.Color( 0xffffff );
                    //color2.setHSV( /*colorrrrr*/0.0, 1.0, 1.0 );
                    color2.setHSL( /*colorrrrr*/0.0, 1.0, 1.0 );
                    newFace2.vertexColors[ 0 ] = color2;
                    newFace2.vertexColors[ 1 ] = color2;
                    newFace2.vertexColors[ 2 ] = color2;
                    hexoplanetGeometry.faces.push(newFace2);
                    // hexoplanetGeometry.faceVertexUvs[ 0 ].push( [
                    //         new THREE.UV( 0.5, 1 ),
                    //         new THREE.UV(0, 0 ),
                    //         new THREE.UV( 1, 0 )
                    //     ] ); 

                    //BASE
                    pCurrentHexData.aFaces.push(hexoplanetGeometry.faces.length);
                    var newFace3 = new THREE.Face3(hexoplanetGeometry.vertices.length - 2,aNeighborsInfo[i][j].vertexID, hexoplanetGeometry.vertices.length - 1);
                    color2 = new THREE.Color( 0xffffff );
                    //color2.setHSV( colorrrrr, 1.0, 1.0 );
                    color2.setHSL( colorrrrr, 1.0, 1.0 );
                    newFace3.vertexColors[ 0 ] = color2;
                    newFace3.vertexColors[ 1 ] = color2;
                    newFace3.vertexColors[ 2 ] = color2;
                    hexoplanetGeometry.faces.push(newFace3);
                    // hexoplanetGeometry.faceVertexUvs[ 0 ].push( [
                    //         new THREE.UV( 0.5, 1 ),
                    //         new THREE.UV(0, 0 ),
                    //         new THREE.UV( 1, 0 )
                    //     ] ); 

                    //BASE 
                    pCurrentHexData.aFaces.push(hexoplanetGeometry.faces.length);
                    var newFace4 = new THREE.Face3(aNeighborsInfo[i][j].vertexID,aNeighborsInfo[i][(j + 1) % aNeighborsInfo[i].length].vertexID,hexoplanetGeometry.vertices.length - 1);
                    color2 = new THREE.Color( 0xffffff );
                    //color2.setHSV( colorrrrr, 1.0, 1.0 );
                    color2.setHSL( colorrrrr, 1.0, 1.0 );
                    newFace4.vertexColors[ 0 ] = color2;
                    newFace4.vertexColors[ 1 ] = color2;
                    newFace4.vertexColors[ 2 ] = color2;
                    hexoplanetGeometry.faces.push(newFace4);
                    // hexoplanetGeometry.faceVertexUvs[ 0 ].push( [
                    //         new THREE.UV( 0.5, 1 ),
                    //         new THREE.UV(0, 0 ),
                    //         new THREE.UV( 1, 0 )
                    //     ] ); 


                }
            }

            g_HexPlanetData.push(pCurrentHexData);


        }
        //console.log(hexoplanetGeometry.vertices);
        //console.log(aNeighborsInfo);

    // Project to sphere	
    /*	for ( var i = 0; i < hexoplanetGeometry.vertices.length; i ++ )
        {
            hexoplanetGeometry.vertices[i].normalize();
            hexoplanetGeometry.vertices[i].multiplyScalar(radius);
//						p *= kPlanetRadius;
//						(*ti).m_vertPos = p;
        }*/

    }

/*		for ( var i = 0; i < hexoplanetGeometry.vertices.length; i ++ )
        {
            hexoplanetGeometry.vertices[i].normalize();
            hexoplanetGeometry.vertices[i].multiplyScalar(radius + 10 - Math.random()*20);
//						p *= kPlanetRadius;
//						(*ti).m_vertPos = p;
        }*/
//	console.log(g_HexPlanetData);

    
/*	for ( var i = 0; i < g_HexPlanetData.length; i ++ )
    {
        for(var j = 0; j < g_HexPlanetData[i].aTopFaces.length; j++)
        {
            var currentFace = hexoplanetGeometry.faces[g_HexPlanetData[i].aTopFaces[j]];
            
            hexoplanetGeometry.vertices[currentFace.a].normalize();
            hexoplanetGeometry.vertices[currentFace.a].multiplyScalar(300);
            hexoplanetGeometry.vertices[currentFace.b].normalize();
            hexoplanetGeometry.vertices[currentFace.b].multiplyScalar(300);
            hexoplanetGeometry.vertices[currentFace.c].normalize();
            hexoplanetGeometry.vertices[currentFace.c].multiplyScalar(300);
        }					

    }*/

    hexoplanetGeometry.computeFaceNormals();
    hexoplanetGeometry.computeVertexNormals();
    // hexoplanetGeometry.computeCentroids();
    hexoplanetGeometry.center();
    hexoplanetGeometry.computeTangents();

    hexoplanetGeometry.computeBoundingBox();
    hexoplanetGeometry.computeBoundingSphere();

    //Calculate neighbors
    //------------------
    for ( var i = 0; i < g_HexPlanetData.length; i ++ )
    {
        var center = g_HexPlanetData[i].vCenter;
        var aClosests = new Array();

        for(var j = 0; j < g_HexPlanetData.length; j++)
        {

            var newEntry = new Object();
            newEntry.id = j;
            newEntry.distance = center.distanceToSquared(g_HexPlanetData[j].vCenter);
            aClosests.push(newEntry);
        }	

        aClosests.sort(function(a,b){return a.distance > b.distance});

        for(var j = 0; j < g_HexPlanetData[i].aTopFaces.length; j++)
        {
            g_HexPlanetData[i].aNeighbors.push(aClosests[j+1].id);
        }
        //	console.log(aClosests);

    }



        //aNeighbors
    //------------------
    //document.getElementById( "lbl_fcs" ).innerHTML = 'Faces: ' + hexoplanetGeometry.faces.length;
    //document.getElementById( "lbl_hex" ).innerHTML = 'Hexagons: ' + g_HexPlanetData.length;

    return hexoplanetGeometry;
}

function onDocumentMouseMove( event ) {

    mouseX = ( event.clientX - windowHalfX );
    mouseY = ( event.clientY - windowHalfY );

    mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse2D.y =- ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    // mouseX = ( event.clientX - windowHalfX );
    // mouseY = ( event.clientY - windowHalfY );

    // mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    // mouse2D.y =- ( event.clientY / window.innerHeight ) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( mouse2D, camera );
    
    const intersects = raycaster.intersectObjects( scene.children );
   // const chat = document.getElementById('chat');

    //var ray = projector.pickingRay( mouse2D.clone(), camera );	
    //var intersects = ray.intersectObjects( scene.children );

    if ( intersects.length > 0 ) {

        console.log(intersects[0].face.centroid);

        var faceID = intersects[0].faceIndex;
        var hexID;
        for ( var i = 0; i < g_HexPlanetData.length; i ++ )
        {
            for(var j = 0; j < g_HexPlanetData[i].aFaces.length; j++)
            {

                if (g_HexPlanetData[i].aFaces[j] == faceID)
                {
                    hexID = i;
                    console.log('ENCONTRADO ' + i );
                    break;

                }

            }					

        }

        //document.getElementById( "lbl_sel" ).innerHTML = 'Selected: ' + hexID;
        //document.getElementById( "lbl_ngh" ).innerHTML = 'Neighbors: ' + 	g_HexPlanetData[hexID].aNeighbors;

        switch ( event.button ) {

            case 0: g_HexPlanetData[hexID].fHeight+=10; break;
            case 2: g_HexPlanetData[hexID].fHeight-=10; break;

        }
        doRefreshGeometry();
        /*cubeGeo = new THREE.CubeGeometry( 5, 5, 5 );
        cubeMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff80, ambient: 0x00ff80, shading: THREE.FlatShading } );
        cubeMaterial.color.setHSV( 0.1, 0.7, 1.0 );
        cubeMaterial.ambient = cubeMaterial.color;

        var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
        voxel.position.copy( intersects[0].face.centroid );
        voxel.matrixAutoUpdate = false;
        voxel.updateMatrix();
        scene.add( voxel );*/
    }



}

//



function doSmooth() {
    
    var newHeights = new Array();
    for ( var i = 0; i < g_HexPlanetData.length; i ++ )
    {
        var neighbordsHeight = 0.0;
        for(var j = 0; j < g_HexPlanetData[i].aNeighbors.length; j++)
        {
            neighbordsHeight+=g_HexPlanetData[g_HexPlanetData[i].aNeighbors[j]].fHeight;
        }
        neighbordsHeight = neighbordsHeight / g_HexPlanetData[i].aNeighbors.length;
        newHeights.push((g_HexPlanetData[i].fHeight + neighbordsHeight) / 2.0);
    }

    // Assign the smooth heights
    for ( var i = 0; i < g_HexPlanetData.length; i ++ )
    {
        g_HexPlanetData[i].fHeight = newHeights[i];
    }

    doRefreshGeometry();
}

function doRefreshGeometry()
{
    //Refresh geometry with the new heights
    for ( var i = 0; i < g_HexPlanetData.length; i ++ )
    {
        var random_length =200 + Math.random()*50;

        for(var j = 0; j < g_HexPlanetData[i].aTopFaces.length; j++)
        {
            var currentFace = g_hexoplanetGeometry.faces[g_HexPlanetData[i].aTopFaces[j]];					
            
            g_hexoplanetGeometry.vertices[currentFace.a].normalize();
            var escalar = g_HexPlanetData[i].fHeight;
            g_hexoplanetGeometry.vertices[currentFace.a].multiplyScalar(escalar);
            g_hexoplanetGeometry.vertices[currentFace.b].normalize();
            g_hexoplanetGeometry.vertices[currentFace.b].multiplyScalar(escalar);
            g_hexoplanetGeometry.vertices[currentFace.c].normalize();
            g_hexoplanetGeometry.vertices[currentFace.c].multiplyScalar(escalar);
        }				

    }
    g_hexoplanetGeometry.verticesNeedUpdate = true;

    //	g_hexoplanetGeometry.computeFaceNormals();
    //	g_hexoplanetGeometry.computeVertexNormals();
        //g_hexoplanetGeometry.centroid();
        //g_hexoplanetGeometry.center();
    //	g_hexoplanetGeometry.computeTangents();

    g_hexoplanetGeometry.computeBoundingBox();
    g_hexoplanetGeometry.computeBoundingSphere();
}



function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


function animate() {

    requestAnimationFrame( animate );

    render();
    //stats.update();

}

function render() {

    var delta = clock.getDelta();
   //controls.update( delta );

    // if (guiConfig.bAnimation)
    // {
    //     var sintime = Math.abs(Math.sin(clock.getElapsedTime()));
    //     for ( var i = 0; i < g_HexPlanetData.length; i ++ )
    //     {
    //         var random_length =200 + Math.random()*50;

    //         for(var j = 0; j < g_HexPlanetData[i].aTopFaces.length; j++)
    //         {
    //             var currentFace = g_hexoplanetGeometry.faces[g_HexPlanetData[i].aTopFaces[j]];
                
                
    //             g_hexoplanetGeometry.vertices[currentFace.a].normalize();
    //             var escalar = 200.0 + (g_HexPlanetData[i].fHeight - 200.0)*sintime;
    //             //console.log(escalar);
    //             g_hexoplanetGeometry.vertices[currentFace.a].multiplyScalar(escalar);
    //             g_hexoplanetGeometry.vertices[currentFace.b].normalize();
    //             g_hexoplanetGeometry.vertices[currentFace.b].multiplyScalar(escalar);
    //             g_hexoplanetGeometry.vertices[currentFace.c].normalize();
    //             g_hexoplanetGeometry.vertices[currentFace.c].multiplyScalar(escalar);
    //         }				

    //     }
    //     g_hexoplanetGeometry.verticesNeedUpdate = true;
    // }

    renderer.render( scene, camera );

}