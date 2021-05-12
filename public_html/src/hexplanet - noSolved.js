class Hexplanet{
    constructor(){
        this.meshHex
        this.group1
        this.group2
        this.group3
        this.light
        this.mouse = new THREE.Vector2();
        this.mouseX = 0
        this.mouseY = 0;
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.mouse2D
        this.projector;
        this.clock = new THREE.Clock();
        this.g_light;
        this.g_hexoplanetGeometry;
        this.hexoplanetGeometry;
        this.g_HexPlanetData;
        this.iNumSubdivisions
        this.g_material11
    }

    hexGeo() {

        this.iNumSubdivisions = 3;
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
        this.g_material11 = new THREE.MeshToonMaterial({ color: 0x112233, ambient: 0xbbbbbb });
    
        this.mouse2D = new THREE.Vector3( 0, 10000, 0.5 );
        //projector = new THREE.Projector();
    
                    //this.hexoplanetGeometry.mergeVertices();
        
        this.g_hexoplanetGeometry = this.createHexSphere(this.iNumSubdivisions);
        this.meshHex = new THREE.Mesh( this.g_hexoplanetGeometry, this.g_material11 );
        this.meshHex.position.y = 2;
        this.meshHex.position.x = 3;
    
        document.addEventListener( 'mousemove', this.onDocumentMouseMove, false );
        document.addEventListener( 'mousedown', this.onDocumentMouseDown, false );
        window.addEventListener( 'resize', this.onWindowResizee, false );
     
    }
    
    perpendicular( vector )
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
    
    
   
    
    
  createHexSphere(iNumSubdiv)
    {

      function  HexData () {
            this.aFaces = new Array();
            this.aTopFaces = new Array();
            this.iCenterId = 0;
            this.vCenter =  new THREE.Vector3(0,0,0);
            this.aNeighbors= new Array();
            this.fHeight = 100.0;
        }

        var faceIndices = [ 'a', 'b', 'c', 'd' ];
    
        var color, f, f2, f3, p, n, vertexIndex;
    
        var radius = 200.0;				
    
           this.hexoplanetGeometry =  new THREE.IcosahedronGeometry( 200, 0 );
        this.hexoplanetGeometry.dynamic = true;
        
    
        for(var pataticas = 0; pataticas < iNumSubdiv; pataticas++)
        {
    
            var aNeighborsInfo  = new Array();
            var g_HexPlanetData = new Array();
    
            //this.hexoplanetGeometry.attributes.normal.count
            for ( var i = 0; i < this.hexoplanetGeometry.faces.length; i ++ )
            {
                f  = this.hexoplanetGeometry.faces[ i ];
                n = ( f instanceof THREE.Face3 ) ? 3 : 4;
    
                var centerVertex = new THREE.Vector3(0,0,0);
                var aCurrentVertexID  = new Array();
    
                for( var j = 0; j < n; j++ )
                {
                    vertexIndex = f[ faceIndices[ j ] ];
                    p = this.hexoplanetGeometry.vertices[ vertexIndex ];
                    //centerVertex.addSelf(p);
                    centerVertex.add(p);
    
                    aCurrentVertexID.push(vertexIndex);
                }
    
                centerVertex.divideScalar( n );
    
                this.hexoplanetGeometry.vertices.push(centerVertex);
    
                //Store neighbords info
                for(var id = 0; id < aCurrentVertexID.length; id++)
                {	
    
                    var directionVector = this.hexoplanetGeometry.vertices[0].clone();
                    directionVector = this.perpendicular(directionVector);
    
                    //var v1 = directionVector.subSelf(this.hexoplanetGeometry.vertices[ aCurrentVertexID[id] ]);
                    var v1 = directionVector.sub(this.hexoplanetGeometry.vertices[ aCurrentVertexID[id] ]);		
                    var nrm = centerVertex.clone();
                    var v2 = centerVertex.clone();
                    //v2 = v2.subSelf(this.hexoplanetGeometry.vertices[ aCurrentVertexID[id] ]);	
                    v2 = v2.sub(this.hexoplanetGeometry.vertices[ aCurrentVertexID[id] ]);			
                    nrm = nrm.normalize();
                    v1 = v1.normalize();
                    v2 = v2.normalize();
    
                    var angle = Math.acos( v1.dot( v2 ) );
                    //var dir = nrm.dot( v1.crossSelf( v2 ) );
                    var dir = nrm.dot( v1.cross( v2 ) );
                    if (dir < 0.0) angle = 3.14 + (3.14 - angle);
    
                    if(aNeighborsInfo[aCurrentVertexID[id]] == undefined) aNeighborsInfo[aCurrentVertexID[id]] = new Array();
    
                    var neighbordsObject = new Object();
                    neighbordsObject.vertexID = this.hexoplanetGeometry.vertices.length - 1;
                    neighbordsObject.angle = angle;
                    aNeighborsInfo[aCurrentVertexID[id]].push(neighbordsObject);
                }
    
            }
    
            for ( var i = 0; i < this.hexoplanetGeometry.vertices.length; i ++ )
            {
                this.hexoplanetGeometry.vertices[i].normalize();
                this.hexoplanetGeometry.vertices[i].multiplyScalar(radius);
            }
    
            this.hexoplanetGeometry.faces.splice(0, this.hexoplanetGeometry.faces.length);	
            var colorrrrr = 0;
            for ( var i = 0; i < aNeighborsInfo.length; i ++ ) 
            {
                aNeighborsInfo[i].sort(function(a,b){return a.angle > b.angle})
                colorrrrr+=1/aNeighborsInfo.length;
                var random_length = radius + Math.random()*50.0;
                
                var pCurrentHexData = new HexData;
                pCurrentHexData.fHeight = random_length;						
                pCurrentHexData.iCenterId = i;
                pCurrentHexData.vCenter =  this.hexoplanetGeometry.vertices[i];
                for ( var j = 0; j < aNeighborsInfo[i].length; j ++ ) 
                {
                    if (pataticas < (iNumSubdiv - 1) )
                    {
                        pCurrentHexData.aFaces.push(this.hexoplanetGeometry.faces.length);
                        pCurrentHexData.aTopFaces.push(this.hexoplanetGeometry.faces.length);
                        
                        var newFace = new THREE.Face3(i,aNeighborsInfo[i][j].vertexID,aNeighborsInfo[i][(j + 1) % aNeighborsInfo[i].length].vertexID);
    
                        color = new THREE.Color( 0xffffff );
                        //color.setHSV( colorrrrr, 1.0, 1.0 );
                        color.setHSL( colorrrrr, 1.0, 1.0 );
    
                        newFace.vertexColors[ 0 ] = color;
                        newFace.vertexColors[ 1 ] = color;
                        newFace.vertexColors[ 2 ] = color;
                        this.hexoplanetGeometry.faces.push(newFace);
    
                        // this.hexoplanetGeometry.faceVertexUvs[ 0 ].push( [
                        //         new THREE.UV( 0.5, 1 ),
                        //         new THREE.UV(0, 0 ),
                        //         new THREE.UV( 1, 0 )
                        //     ] ); 
                    }
                    else
                    {
                        
                        var vert1 = this.hexoplanetGeometry.vertices[i].clone();
                        vert1.normalize();
                        vert1.multiplyScalar(random_length);
                        var vert2 = this.hexoplanetGeometry.vertices[aNeighborsInfo[i][j].vertexID].clone();
                        vert2.normalize();
                        vert2.multiplyScalar(random_length);
                        var vert3 = this.hexoplanetGeometry.vertices[aNeighborsInfo[i][(j + 1) % aNeighborsInfo[i].length].vertexID].clone();
                        vert3.normalize();
                        vert3.multiplyScalar(random_length);
    
                        this.hexoplanetGeometry.vertices.push(vert1);
                        this.hexoplanetGeometry.vertices.push(vert2);
                        this.hexoplanetGeometry.vertices.push(vert3);
    
                        //TOP
                        pCurrentHexData.aFaces.push(this.hexoplanetGeometry.faces.length);
                        pCurrentHexData.aTopFaces.push(this.hexoplanetGeometry.faces.length);
                        var newFace2 = new THREE.Face3(this.hexoplanetGeometry.vertices.length - 3,this.hexoplanetGeometry.vertices.length - 2,this.hexoplanetGeometry.vertices.length - 1);
                       var color2 = new THREE.Color( 0xffffff );
                        //color2.setHSV( /*colorrrrr*/0.0, 1.0, 1.0 );
                        color2.setHSL( /*colorrrrr*/0.0, 1.0, 1.0 );
                        newFace2.vertexColors[ 0 ] = color2;
                        newFace2.vertexColors[ 1 ] = color2;
                        newFace2.vertexColors[ 2 ] = color2;
                        this.hexoplanetGeometry.faces.push(newFace2);
                        // this.hexoplanetGeometry.faceVertexUvs[ 0 ].push( [
                        //         new THREE.UV( 0.5, 1 ),
                        //         new THREE.UV(0, 0 ),
                        //         new THREE.UV( 1, 0 )
                        //     ] ); 
    
                        //BASE
                        pCurrentHexData.aFaces.push(this.hexoplanetGeometry.faces.length);
                        var newFace3 = new THREE.Face3(this.hexoplanetGeometry.vertices.length - 2,aNeighborsInfo[i][j].vertexID, this.hexoplanetGeometry.vertices.length - 1);
                        color2 = new THREE.Color( 0xffffff );
                        //color2.setHSV( colorrrrr, 1.0, 1.0 );
                        color2.setHSL( colorrrrr, 1.0, 1.0 );
                        newFace3.vertexColors[ 0 ] = color2;
                        newFace3.vertexColors[ 1 ] = color2;
                        newFace3.vertexColors[ 2 ] = color2;
                        this.hexoplanetGeometry.faces.push(newFace3);
                        // this.hexoplanetGeometry.faceVertexUvs[ 0 ].push( [
                        //         new THREE.UV( 0.5, 1 ),
                        //         new THREE.UV(0, 0 ),
                        //         new THREE.UV( 1, 0 )
                        //     ] ); 
    
                        //BASE 
                        pCurrentHexData.aFaces.push(this.hexoplanetGeometry.faces.length);
                        var newFace4 = new THREE.Face3(aNeighborsInfo[i][j].vertexID,aNeighborsInfo[i][(j + 1) % aNeighborsInfo[i].length].vertexID,this.hexoplanetGeometry.vertices.length - 1);
                        color2 = new THREE.Color( 0xffffff );
                        //color2.setHSV( colorrrrr, 1.0, 1.0 );
                        color2.setHSL( colorrrrr, 1.0, 1.0 );
                        newFace4.vertexColors[ 0 ] = color2;
                        newFace4.vertexColors[ 1 ] = color2;
                        newFace4.vertexColors[ 2 ] = color2;
                        this.hexoplanetGeometry.faces.push(newFace4);
                        // this.hexoplanetGeometry.faceVertexUvs[ 0 ].push( [
                        //         new THREE.UV( 0.5, 1 ),
                        //         new THREE.UV(0, 0 ),
                        //         new THREE.UV( 1, 0 )
                        //     ] ); 
    
    
                    }
                }
    
                g_HexPlanetData.push(pCurrentHexData);
    
    
            }
            //console.log(this.hexoplanetGeometry.vertices);
            //console.log(aNeighborsInfo);
    
        // Project to sphere	
        /*	for ( var i = 0; i < this.hexoplanetGeometry.vertices.length; i ++ )
            {
                this.hexoplanetGeometry.vertices[i].normalize();
                this.hexoplanetGeometry.vertices[i].multiplyScalar(radius);
    //						p *= kPlanetRadius;
    //						(*ti).m_vertPos = p;
            }*/
    
        }
    
    /*		for ( var i = 0; i < this.hexoplanetGeometry.vertices.length; i ++ )
            {
                this.hexoplanetGeometry.vertices[i].normalize();
                this.hexoplanetGeometry.vertices[i].multiplyScalar(radius + 10 - Math.random()*20);
    //						p *= kPlanetRadius;
    //						(*ti).m_vertPos = p;
            }*/
    //	console.log(g_HexPlanetData);
    
        
    /*	for ( var i = 0; i < g_HexPlanetData.length; i ++ )
        {
            for(var j = 0; j < g_HexPlanetData[i].aTopFaces.length; j++)
            {
                var currentFace = this.hexoplanetGeometry.faces[g_HexPlanetData[i].aTopFaces[j]];
                
                this.hexoplanetGeometry.vertices[currentFace.a].normalize();
                this.hexoplanetGeometry.vertices[currentFace.a].multiplyScalar(300);
                this.hexoplanetGeometry.vertices[currentFace.b].normalize();
                this.hexoplanetGeometry.vertices[currentFace.b].multiplyScalar(300);
                this.hexoplanetGeometry.vertices[currentFace.c].normalize();
                this.hexoplanetGeometry.vertices[currentFace.c].multiplyScalar(300);
            }					
    
        }*/
    
        this.hexoplanetGeometry.computeFaceNormals();
        this.hexoplanetGeometry.computeVertexNormals();
        // this.hexoplanetGeometry.computeCentroids();
        this.hexoplanetGeometry.center();
        this.hexoplanetGeometry.computeTangents();
    
        this.hexoplanetGeometry.computeBoundingBox();
        this.hexoplanetGeometry.computeBoundingSphere();
    
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
        //document.getElementById( "lbl_fcs" ).innerHTML = 'Faces: ' + this.hexoplanetGeometry.faces.length;
        //document.getElementById( "lbl_hex" ).innerHTML = 'Hexagons: ' + g_HexPlanetData.length;
    
        return this.hexoplanetGeometry;
    }

    onDocumentMouseMove( event ) {
    
        this.mouse2D = new THREE.Vector3( 0, 10000, 0.5 );
        this.mouseX = event.clientX - this.windowHalfX 
        this.mouseY = event.clientY - this.windowHalfY 
    
        this.mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse2D.y =- ( event.clientY / window.innerHeight ) * 2 + 1;
    
    }
    
     onDocumentMouseDown( event ) {
         var g = new Game()
        event.preventDefault();
        this.mouse2D = new THREE.Vector3( 0, 10000, 0.5 );

        // mouseX = ( event.clientX - windowHalfX );
        // mouseY = ( event.clientY - windowHalfY );
    
        // mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        // mouse2D.y =- ( event.clientY / window.innerHeight ) * 2 + 1;
    
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera( this.mouse2D, g.camera );
        
        const intersects = raycaster.intersectObjects( g.scene.children);
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
            this.doRefreshGeometry();
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
    
    
    
     doSmooth() {
        
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
    
        this.doRefreshGeometry();
    }
    
     doRefreshGeometry()
    {
        //Refresh geometry with the new heights
        for ( var i = 0; i < g_HexPlanetData.length; i ++ )
        {
            var random_length =200 + Math.random()*50;
    
            for(var j = 0; j < g_HexPlanetData[i].aTopFaces.length; j++)
            {
                var currentFace = this.g_hexoplanetGeometry.faces[g_HexPlanetData[i].aTopFaces[j]];					
                
                this.g_hexoplanetGeometry.vertices[currentFace.a].normalize();
                var escalar = g_HexPlanetData[i].fHeight;
                this.g_hexoplanetGeometry.vertices[currentFace.a].multiplyScalar(escalar);
                this.g_hexoplanetGeometry.vertices[currentFace.b].normalize();
                this.g_hexoplanetGeometry.vertices[currentFace.b].multiplyScalar(escalar);
                this.g_hexoplanetGeometry.vertices[currentFace.c].normalize();
                this.g_hexoplanetGeometry.vertices[currentFace.c].multiplyScalar(escalar);
            }				
    
        }
        this.g_hexoplanetGeometry.verticesNeedUpdate = true;
    
        //	this.g_this.hexoplanetGeometry.computeFaceNormals();
        //	this.g_this.hexoplanetGeometry.computeVertexNormals();
            //this.g_this.hexoplanetGeometry.centroid();
            //this.g_this.hexoplanetGeometry.center();
        //	this.g_this.hexoplanetGeometry.computeTangents();
    
        this.g_hexoplanetGeometry.computeBoundingBox();
        this.g_hexoplanetGeometry.computeBoundingSphere();
    }
    
    
    
     onWindowResizee() {
    
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
    
    }
    
}



