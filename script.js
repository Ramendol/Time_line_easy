document.addEventListener('DOMContentLoaded', function() {
    console.log("Event listener started");

    


    //create a class for a node constructor
    class Node {
        static idCounter = 0;
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.linkedNodes = [];
            this.id = Node.idCounter++;
            this.status = "";
            this.label = "";
            this.date = "";
            this.date_calendar = "";
            this.hidden = false;
        }

        addLinkedNode(node) {
            this.linkedNodes.push(node);
        }

        static resetIdCounter() {
            Node.idCounter = 0;
        }

    }

    class Frame_line{
        static idCounter = 0;
        constructor(x1, y1,x2,y2,line_width,lineType) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
            this.id = Frame_line.idCounter++;
            this.line_width = line_width;
            this.lineType = lineType;
            this.type = "frame";


        }

        static resetIdCounter() {
            Frame_line.idCounter = 0;
        }

    }

    class Text_box{
        static idCounter = 0;
        constructor(pos_x,pos_y,text_value,font_size,text_color,font_name) {
            this.pos_x = pos_x;
            this.pos_y = pos_y;
            this.text_value = text_value;
            this.font_size = font_size;
            this.text_color = text_color;
            this.text_font_name = font_name;
            this.type = "text";

        }

        isPointInside(mouseX, mouseY) {
            // Calculate the boundaries of the text box

            let textMetrics = ctx.measureText(this.text_value)
            //console.log(textMetrics)
            //console.log(this.font_size)
            const minX = this.pos_x 
            const minY = this.pos_y -(textMetrics.actualBoundingBoxAscent);
            const maxX = this.pos_x + textMetrics.width ;
            const maxY = this.pos_y + textMetrics.actualBoundingBoxDescent;
        
            // Check if the mouse coordinates are within the bounding box
            return mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY;
        }

        static resetIdCounter() {
            Text_box.idCounter = 0;
        }

    }
    
    
    //#region //define parameters and assign elemenets*********************
    //define some basic parameters for points and grid
    let std_radius = 10;
    let gridSize = 40;
    let lineWidth_default = 3;
    let list_of_nodes = [];
    let initial_line_node = null;
    let current_node_select = null
    let moving = false;
    let auto_buffer = false;
    let frame_point_start = null;
    let final_frame_point = null;
    let list_of_frame_lines = [];
    let list_of_text = [];
    let temporary_element_stored;
    let file_save_mode = false;

    

    //color for nodes
    const selected_color = 'rgba(100,100,100,1)'
    const status_color_good = "Green"
    const status_color_warning = "Yellow"
    const status_color_issue = "Red"
    const status_color_close = 'rgba(20,20,20,1)'
    const std_color = "Black"

    //font size labels for nodes
    const font_label_size = 15
    const font_date_size = 12
    
    //get elements

    const el_node_label = document.getElementById("node_label");
    const el_node_date = document.getElementById("node_date");
    const el_mouse_x_node = document.getElementById("mouse_x");
    const el_mouse_y_node = document.getElementById("mouse_y");
    const el_node_id_field = document.getElementById("node_id_field");
    const el_calendar_1 = document.getElementById("calendar_1");
    const el_days_count = document.getElementById("days_count");
    const canvas = document.getElementById("myCanvas");
    const el_line_stroke = document.getElementById("line_stroke");
    const el_line_type = document.getElementById("lineType");
    const el_text_stroke = document.getElementById("text_stroke");
    const el_text_color = document.getElementById("color_1");
    const el_text_input = document.getElementById("text_canvas_1_input");
    let el_fileInput = document.getElementById("fileNameInput");
    const el_open_dialog = document.getElementById("popup_dialog_2");
    let el_userFileInput = document.getElementById("userFileInput");
    

    let ctx = canvas.getContext("2d");
    
    //buttons

    //menu
    const btn_add_info = document.getElementById("add_label");
    const btn_edit_info = document.getElementById("edit_label");
    const btn_cancel_info = document.getElementById("cancel");
    const btn_clear = document.getElementById("clear");
    const btn_text_add = document.getElementById("add_text_canvas_1");
    const btn_text_edit = document.getElementById("edit_text_canvas_1");
    const btn_text_cancel = document.getElementById("cancel_text_canvas_1");
    const btn_move2 = document.getElementById("move_2");
    const btn_save = document.getElementById("save");
    const btn_load = document.getElementById("load");
    const btn_ok_file = document.getElementById("btn_ok_file");
    const btn_cancel_file_dialog = document.getElementById("cancel_file_dialog");




    
    const checkbox1 = document.getElementById("checkbox1");
    




    //quick_menu
    const btn_qmenu_button1 = document.getElementById("button1");
    const btn_qmenu_button2 = document.getElementById("button2");
    const btn_qmenu_button3 = document.getElementById("button3");

    //auxiliar pop-box
    const popupBox = document.getElementById("popupBox");
    const popupBox_text_canvas = document.getElementById("popup_dialog_1");

    //#endregion


   

    //*******START THE CODE HERE **************************************
    //*************************************************************** */



    
    //#region //Define functions ***********************************
     //function draw a circle

    function clear_inputs(){

        let elements = document.querySelectorAll('input');
        console.log(elements)

        for (let element of elements){
                element.value = ""
        }
        el_line_stroke.value = 1;
        el_line_type.value = 'solid';
        el_text_color.value = "Black";
        el_text_stroke.value = 20;
    }

    clear_inputs();
    refresh_display();


    function drawCircle(x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();    

        ctx.arc(x,y, radius, 0, 2 * Math.PI);
        ctx.fill();

    }

    // Function to draw a line between two points
    function drawLine(x1, y1, x2, y2,lineWidth,lineType) {
        ctx.beginPath();

        let new_grd_size = gridSize/2

        let a = stickToGrid(x1,y1,new_grd_size);
        let b = stickToGrid(x2,y2,new_grd_size);


        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        ctx.save();
       
        if (lineWidth === undefined){
            lineWidth = lineWidth_default;
        }

        if (lineType != undefined){
      
            if (lineType === 'dashed') {
                ctx.setLineDash([5*lineWidth, 5*lineWidth]); // Set a dashed pattern
            } else if (lineType === 'dotted') {
                ctx.setLineDash([lineWidth, lineWidth]); // Set a dotted pattern
            } else if (lineType === 'solid') {
                ctx.setLineDash([]); // Set a solid line (default)
            } else {
                ctx.setLineDash([]); // Set a solid line (default)
            }
        }


        ctx.lineWidth = lineWidth; // Set
        ctx.stroke();

        lineType = undefined;

        ctx.restore();
        
    }

    //funtion to get mouse position
    function getMousePos() {
        var rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    //function to stick the point into a grid
    function stickToGrid(x, y, gridSize) {

        const rect = canvas.getBoundingClientRect();
        //console.log("before",x,y);

        x = x-rect.left;
        y = y-rect.top;

        //console.log('after',x,y);

        const roundedX = Math.round(x / gridSize)*gridSize  ;
        const roundedY = Math.round(y / gridSize)*gridSize ;

        //console.log('roundedX',roundedX,'roundedY',roundedY)

      


        return { x: roundedX, y: roundedY };
    }

    //function to hightlight a button when selected
    function highlight_button(button_id,class_name){
        
        //console.log("highligth button")
        const selector = `[data-${'class'}="${'menu_btn'}"]`;
        let buttons_menu = document.querySelectorAll(selector)
  
        for (btn of buttons_menu){

            if (btn.className === 'top_button_menu active'){
                btn.className = 'top_button_menu';
            }

            if (btn.className === 'menu-button active'){
                btn.className = 'menu-button';
            }
        }

        if (class_name === undefined){
            let btn_hightlight = document.getElementById(button_id)
            btn_hightlight.className = 'top_button_menu active';
        }

        if (class_name === 'menu-button'){
            let btn_hightlight = document.getElementById(button_id)
            btn_hightlight.className = 'menu-button active';
        }

      
        
    }


    //this function check mouse position and return a node element if exist is that possition param: Mouse Position
    function get_node_from_position(mouse_position_val){
        for (const node of list_of_nodes) {
            //console.log(node)
            
            //check the distance the position clicked and if there is a node , loookin the position of node
            const distance = Math.sqrt((node.x - mouse_position_val.x) ** 2 + (node.y - mouse_position_val.y) ** 2);
            
            //check if distance between origin o radios and end radio is within
            if (distance <= std_radius) {
                
                //console.log("Found a node")
                //console.log("node ID",node.id)
                node_item = node
                return node_item
            }
        }

        return null

    }

 
    //create a grid canvas
    function draw_grid(){

        if (checkbox1.checked) {
            for (let x = 0; x < canvas.width; x += gridSize) {
                for (let y = 0; y < canvas.height; y += gridSize) {
                    drawCircle(x,y,2,"lightgray")
                }
                
            }
        }
    }

    function connect_points(x1,y1,x2,y2,lineWidth,lineType){
          
        
        if (btn_qmenu_button2.className === "menu-button active"){

            //check relative position to decide if drawn x or y first
            if (y2 > y1){
                drawLine(x1,y1,x1,y2,lineWidth,lineType);
                drawLine(x1,y2,x2,y2,lineWidth,lineType);
            }else{
                drawLine(x1,y1,x2,y1,lineWidth,lineType);
                drawLine(x2,y1,x2,y2,lineWidth,lineType);
            }
        }else{
            drawLine(x1,y1,x2,y2,lineWidth,lineType);

        }
                  

    }
  
    function open_popup_info_display(mode_val,node_name_val,date_calendar_val,mouse_position_val,node_id_val){

            popupBox.style.display = "flex";

            setTimeout(function() {
                el_node_label.focus();
            }, 10);

            if (mode_val === "add"){

                if (btn_qmenu_button3.className ===  "menu-button active" && btn_qmenu_button1.className ===  "menu-button active" && auto_buffer === true){
                    
                   

                    //get the last node created
                    let last_node = list_of_nodes[list_of_nodes.length -1];



                    //copy the data from last node to new node
                    el_node_date.value = last_node.date_calendar;

                    //reset all other data in pop up menu
                    el_node_label.value = "";
                    el_mouse_x_node.value =  mouse_position_val.x
                    el_mouse_y_node.value =  mouse_position_val.y
                    el_node_id_field.value =  node_id_val
                  
                    el_days_count.value = 0
                    el_node_date.value = ""



                }else{
                 

                    el_node_label.value = node_name_val;
                    el_node_date.value = date_calendar_val
                    el_mouse_x_node.value =  mouse_position_val.x
                    el_mouse_y_node.value =  mouse_position_val.y
                    el_node_id_field.value =  node_id_val
                    el_calendar_1.value =  date_calendar_val
                    el_days_count.value = 0
                    el_node_date.value = ""
                }
            
            }

            if (mode_val === "edit"){

                el_node_label.value = current_node_select.label;
                el_node_date.value = ""
                el_mouse_x_node.value =  current_node_select.x
                el_mouse_y_node.value =  current_node_select.y
                el_node_id_field.value =  current_node_select.id
                el_calendar_1.value =  current_node_select.date_calendar;
                el_days_count.value = 0
                el_node_date.value = ""


            }

            //hide not selected button
            if (mode_val == "add"){
                btn_add_info.hidden = false;
                btn_edit_info.hidden = true;
            }

            if (mode_val == "edit"){
                btn_add_info.hidden = true;
                btn_edit_info.hidden = false;

            }

    }

    function open_popup_text_display(mode,element){
        //console.log("popup text")

       
        
        if (mode === "add"){


            popupBox_text_canvas.style.display = "flex";
            el_text_input.value = "";
            setTimeout(function() {
                el_text_input.focus();
            }, 10);

            
        }

        if (mode === "edit"){

            popupBox_text_canvas.style.display = "flex";
            el_text_input.value = element.text_value;
            setTimeout(function() {
                el_text_input.focus();
            }, 10);
        } 

        if (mode === "canceled"){

            popupBox_text_canvas.style.display = "none";

            console.log(btn_text_add.className);

            if (btn_text_add.className === 'top_button_menu active'){
                console.log("mode edit")
                //mode.changeState('text');
            }else{
                //mode.changeState('edit_txt');
            }

        }
     

    }

    function close_popup_info_display(){

        if (popupBox.style.display != "none") {
            popupBox.style.display = "none";
        }
        

    }

    function draw_canvas_node_(x,y,radius,color,label,date_val){
        
        ctx.lineWidth = 1; // Set
        drawCircle(x,y,radius,color)


        let date_converted = convert_date(date_val)

        ctx.font = `${font_label_size}px Roboto`;
        const textWidth_1 = ctx.measureText(label).width;
        ctx.fillStyle = 'white';
        ctx.fillRect(x-(textWidth_1/2), (y-15)-font_label_size,textWidth_1,font_label_size+5)
        ctx.fillStyle = 'Black';
        ctx.save();
        ctx.textAlign = 'center';
       
        ctx.fillText(label, x, y-15);


        ctx.font = `${font_date_size}px Arial`;
        const textWidth = ctx.measureText(date_converted).width;
        ctx.stroke()
      
        ctx.fillStyle = 'white';
        ctx.fillRect(x-(textWidth/2), (y+25)-font_date_size,textWidth,font_date_size+5)
        ctx.fillStyle = 'Black  ';
        ctx.fillText(date_converted, x, y+25);
        ctx.restore();
    }

    function convert_date(calendar_full_date){

        //check if calendar date is not null to cover it
        if (calendar_full_date != ""){
            let new_date = new Date(calendar_full_date);
            let month = new_date.getUTCMonth()
            let day = new_date.getUTCDate()
            
    
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthName = monthNames[month]; // Adjust for zero-based index

        
            let converted_date = `${day}${monthName}` 
            return converted_date;
        }else{
            return "";
        }

    }

    function return_node_status_color(node){
        let color_value = ""
        let node_status = node.status
        switch (node_status) {
            case "Green":
                color_value = status_color_good;
                break;
            case "Yellow":
                color_value = status_color_warning;
                break;
            case "Red":
                color_value = status_color_issue;
                break;
            case "Close":
                color_value = status_color_close;
                break;
            case "Selected":
                    color_value = selected_color;
                break;
        }
        //console.log(color_value)
        return color_value
    }

    function refresh_display(){

        //clear the canvas and drawn a grid again
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         draw_grid();
     
 
         //scan all nodes of the list nodes exist
         for (const node_item of list_of_nodes) {
             //iterate over all other nodes that are linked to this node
             for (let index = 0; index < node_item.linkedNodes.length; index++) {
                 //for each linked node draw a line connection

                 //console.log(node_item);

                if (node_item.linkedNodes != null){
                    for (const node_2 of node_item.linkedNodes){
                        connect_points(node_item.x ,node_item.y,node_2.x ,node_2.y,lineWidth_default,'solid')
                    }
                }
             }
         }
 
         //make sure will draw after lines to avoid superposition
         for (const node_item of list_of_nodes) {
            if (node_item.hidden === false){
                draw_canvas_node_(node_item.x,node_item.y,std_radius,return_node_status_color(node_item),node_item.label,node_item.date_calendar)
            }
        }

        //draw frames
        for(const lines of list_of_frame_lines){


            drawLine(lines.x1,lines.y1,lines.x2,lines.y2,lines.line_width,lines.lineType)

        }

        //draw texts
        for(const text_element of list_of_text){

            //console.log(text_element)
            draw_a_text(text_element.pos_x,text_element.pos_y,text_element.text_value,text_element.font_size,text_element.text_color);
        }


     }

    function create_and_drawn_new_node(mouse_position_val,node_label_name_val,date_calendar_val){
        //transform point to the grid points
        const grid_point = stickToGrid(mouse_position_val.x,mouse_position_val.y,gridSize)

        //create a new node, with points in grid
        node_item = new Node(grid_point.x,grid_point.y)
        node_item.status = "Green"
        node_item.label = node_label_name_val
        node_item.date_calendar = date_calendar_val
       
        //store the node in the list of all network
        list_of_nodes.push(node_item)


        if (btn_qmenu_button1.className === "menu-button active" && list_of_nodes.length > 0 && auto_buffer === true){
            console.log("auto connect")
            //console.log(list_of_nodes[list_of_nodes.length -1])
            node_item.addLinkedNode(list_of_nodes[list_of_nodes.length -2]);

        }

        auto_buffer = true;

        

        refresh_display()

    }

    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        let pointX = e.clientX - rect.left;
        let pointY = e.clientY - rect.top;
        //clear display old position
        
        current_node_select.x = pointX;
        current_node_select.y = pointY;
        
        refresh_display();
        //draw a new circle according to mouse position
        //draw_canvas_node_(pointX, pointY, std_radius, selected_color, "", "");
    }

    function handleMouseMove_2(e) {
        
        //console.log("handle mouse 2")
        
        const rect = canvas.getBoundingClientRect();
        let pointX = e.clientX - rect.left;
        let pointY = e.clientY - rect.top;

        refresh_display();
        
        drawLine(current_node_select.x,current_node_select.y,pointX,pointY,lineWidth_default,'solid')

        
       
      
    }

    function delete_connections(node,delete_ID){

        let node_element = node

        let counter = 0
        for (const linked_node of node_element.linkedNodes){
            //console.log(linked_node.id)

            if (linked_node.id === delete_ID){
                //console.log("node delete")
                node_element.linkedNodes.splice(counter,1)
                
            }else{
                counter += 1;

            }
        }   
    }

    function handleMouseMove_frame_draw(e) {
        
        //console.log("handle mouse 2")
        
        const rect = canvas.getBoundingClientRect();
        let pointX = e.clientX - rect.left;
        let pointY = e.clientY - rect.top;

        refresh_display();

        //Make a logic to lock in X and Y axis uppon to a range

       

        if (pointY < frame_point_start.y + 20  && pointY > frame_point_start.y - 20){  
           
            pointY = frame_point_start.y;
        }

        if (pointX < frame_point_start.x + 20  && pointX > frame_point_start.x - 20){  
           
            pointX = frame_point_start.x;
        }

        let new_pos = stickToGrid(pointX,pointY,(gridSize/2))

        let current_line_width = el_line_stroke.value;
        drawLine(frame_point_start.x,frame_point_start.y,new_pos.x,new_pos.y,current_line_width,el_line_type.value)

        final_frame_point = {x:pointX, y:pointY}; 

       
      
    }

    function isPointNearLine(point, lineStart, lineEnd, tolerance) {
        const distanceToLine = Math.abs(
          (lineEnd.y - lineStart.y) * point.x - (lineEnd.x - lineStart.x) * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x
        ) / Math.sqrt(Math.pow(lineEnd.y - lineStart.y, 2) + Math.pow(lineEnd.x - lineStart.x, 2));
  
        return distanceToLine < tolerance;
    }

    function validate_interger_Input(element,min_value) {
        
        let parsedValue = parseInt(element.value);

        if (isNaN(parsedValue)){
            parsedValue = 1;
        }else{
            parsedValue = element.value;

        }

        // Remove non-numeric characters using a regular expression
        if (parsedValue < min_value){
            parsedValue = min_value;
        }

        element.value = parsedValue;
    }

    function draw_a_text(x,y,text_value,font_size,text_color,font_name){


        //check for defaults

        if (font_size === undefined){
            font_size = '10';
        }

        if (text_color === undefined){
            text_color = 'Black';
        }


        if (font_name === undefined){
            ctx.font = `${font_size}px Roboto`;

        }else{
            ctx.font = `${font_size}px ${font_name}`;
        }

     
     
        ctx.fillStyle = text_color;
        //ctx.textAlign = 'center';
        ctx.fillText(text_value,x,y);
        ctx.stroke();

       
    }

    function get_element_from_position(pos_x,pos_y,type_of_element){
        console.log("get element")

        let tmp_mousePos = {x:pos_x,y:pos_y};

        //check for a text element first

        if (type_of_element === "text"){
            for (const element of list_of_text){
                if(element.isPointInside(pos_x,pos_y) === true){
                    //console.log(text_element)
                    return element;
                }
            }
        }

        
        if (type_of_element === undefined){

            for (const element of list_of_text){
                if(element.isPointInside(pos_x,pos_y) === true){
                    //console.log(text_element)
                    return element;
                }
            }

            //then, check for a frame element 
            for (let index = 0; index < list_of_frame_lines.length; index++) {
                const line = list_of_frame_lines[index];
                
                let linestart = {x:line.x1, y:line.y1}
                let lineend = {x:line.x2, y:line.y2}
                

            line_found = (isPointNearLine(tmp_mousePos,linestart,lineend,10))

            if (line_found === true){
                    console.log("Line");
                    console.log(list_of_frame_lines[index])
                    return list_of_frame_lines[index];
                    
            }
                
            }
        }
    
       
    
        return null

    }

    function edit_text_capture(e){

        const rect = canvas.getBoundingClientRect();
        let pointX = e.clientX - rect.left;
        let pointY = e.clientY - rect.top;

        //console.log(pointX,pointY)

        let element_found = (get_element_from_position(pointX,pointY,"text"))

        if (element_found != null){
            //console.log("Fond a text")
            //console.log(element_found)
            temporary_element_stored = element_found;
            open_popup_text_display('edit',element_found);
        }

        

        
        //console.log(element_found.text_value.length,element_found.font_size)
        


    }

    function handleMouseMove_element_move(e) {
           
            console.log("handle element movement")
            //console.log(mousePos.x,mousePos.y,temporary_element_stored.x1,temporary_element_stored.y1,temporary_element_stored.x2,temporary_element_stored.y2)

            var mousePos = getMousePos();

           
            if (temporary_element_stored.type === "text"){

            let new_pos = stickToGrid(mousePos.x,mousePos.y,(gridSize/2))


            temporary_element_stored.pos_x = new_pos.x;
            temporary_element_stored.pos_y = new_pos.y;
           
        }

        if (temporary_element_stored.type === "frame"){

            //console.log(mousePos.x,mousePos.y,temporary_element_stored.x1,temporary_element_stored.y1,temporary_element_stored.x2,temporary_element_stored.y2)

            let new_pos = stickToGrid(mousePos.x,mousePos.y,(gridSize/2))


            let delta_X1 = new_pos.x - temporary_element_stored.x1;
            let delta_Y1 = new_pos.y - temporary_element_stored.y1;


            temporary_element_stored.x1 = new_pos.x
            temporary_element_stored.y1 = new_pos.y;
            temporary_element_stored.x2 =  temporary_element_stored.x2 + delta_X1 ;
            temporary_element_stored.y2 =  temporary_element_stored.y2 + delta_Y1;  
            
        }

        moving = true;

        refresh_display();
       

    }

    function saveArrayToFile(array1,array2,array3,fileName) {
        
        //console.log("file name is",fileName)

        var combinedData = {
            array1: array1,
            array2: array2,
            array3: array3
          };

        // Convert the combined data to JSON
        var jsonData = JSON.stringify(combinedData);


        var blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });

        console.log("Current file name is:",fileName)
        let update_file_name;
      
    
        var regex = /\(\d+\)/g;
        var result = fileName.replace(regex, "");
        console.log("update_file_name is:",result)
        update_file_name = result;
        
     
        
        // Create a download link for the Blob
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
       
        a.download = update_file_name;
            
        // Trigger a click event on the link
        a.click();  

       
        URL.revokeObjectURL(a.href);

        el_open_dialog.style.display = "none";

        el_fileInput.value = "";
        el_userFileInput.value = "";
     


    }


    function reconstuct_node(array){

       

        Node.resetIdCounter();
        list_of_nodes = [];

        //console.log("node reconstruct", list_of_nodes)

        //first, create the nodes
        for (let index = 0; index < array.length; index++) {
            const element = array[index];

            //console.log("element",element)

            node_item = new Node(element.x,element.y)
            node_item.status = element.status
            node_item.label = element.label
            node_item.date_calendar = element.date_calendar
            list_of_nodes.push(node_item);
            
            
        }

        //then, with nodes created, add the links
        for (let index = 0; index < array.length; index++) {
            console.log(index)
            const element = array[index];

            for (let j = 0; j < list_of_nodes.length; j++) {
                const array_element = list_of_nodes[j];
                if (element.id === array_element.id){

                  
                    //console.log("found match");
                    for (let k = 0; k < element.linkedNodes.length; k++) {
                        let pos = {x:element.linkedNodes[k].x,y:element.linkedNodes[k].y}
                        let selected_node = get_node_from_position(pos)
                        array_element.addLinkedNode(selected_node)
                    }
                }
            }

        }

        //console.log('List of node',list_of_nodes)


    }

    function reconstuct_Frame_lines(array){


        Frame_line.resetIdCounter();
        list_of_frame_lines = [];

        //first, create the nodes
        for (let index = 0; index < array.length; index++) {
            const element = array[index];

            //console.log("element",element)

            new_frame_line = new Frame_line(element.x1,element.y1,element.x2,element.y2,element.line_width,element.lineType)

            list_of_frame_lines.push(new_frame_line);
            
            
        }

    }

    function reconstuct_text(array){


        Text_box.resetIdCounter();
        list_of_text = [];

        //first, create the nodes
        for (let index = 0; index < array.length; index++) {
            const element = array[index];

            console.log("element",element)

             
            new_text = new Text_box(element.pos_x,element.pos_y,element.text_value,element.font_size,element.text_color,element.type)

            list_of_text.push(new_text)
            
            
        }

    }


    //#endregion*************************************************************************************

    async function loadArraysFromFile(fileName) {

        var file = fileName.files[0];
  
        if (!file) {
          console.error('No file selected.');
          return;
        }

        console.log("File name",file)

       
        try {
            // Create a FileReader
            const reader = new FileReader();
        
            // Set up a promise to resolve when the FileReader has loaded the content
            const loadPromise = new Promise((resolve, reject) => {
              reader.onload = (event) => resolve(event.target.result);
              reader.onerror = (error) => reject(error);
            });
        
            // Read the content of the file as text
            reader.readAsText(file);
        
            // Wait for the FileReader to finish loading the content
            const fileContent = await loadPromise;
        
            // Parse the JSON data
            let jsonData = JSON.parse(fileContent);

            jsonData = JSON.parse(jsonData.replace(/\\/g, ''));
        
            // Extract arrays from the parsed JSON data
            var array1 = jsonData.array1;
            var array2 = jsonData.array2;
            var array3 = jsonData.array3;
        
            // Do something with the arrays
            //console.log('Array 1:', array1);
            //console.log('Array 2:', array2);
            //console.log('Array 3:', array3);

            clear_inputs();
            refresh_display();

            reconstuct_node (array1);
            reconstuct_Frame_lines(array2);
            reconstuct_text(array3);
            refresh_display();

            console.log(file)
            el_userFileInput.value = file.name;
        
          } catch (error) {
            console.error('Error loading file:', error.message);
          }
    }

    draw_grid()



   
    //#region //get button event and define which state is active *************************
    const mode = {
        states: {
            add: { description: "add" },
            delete: { description: "delete" },
            connect: { description: "connect" },
            move: { description: "move" },
            change_status:{ description: "change_status" },
            disconnect:{ description: "disconnect" },
            edit:{ description: "edit" },
            frame:{ description: "frame" },
            erase:{ description: "erase" },
            text:{ description: "text" },
            edit_txt:{ description: "edit_txt" },
            move_2:{ description: "move_2" },
            

        },
        currentState: "", // Initial state
        
        // Function to change the state
        changeState(newState) {
            if (this.states[newState]) {
            this.currentState = newState;
            console.log(`State changed to: ${this.states[newState].description}`);
            } else {
            console.error("Invalid state");
            }
        },
        
        // Function to get the current state
        state() {
            return this.states[this.currentState];
        }
    };

    document.getElementById('add').addEventListener('click', () => {
        mode.changeState('add');
        highlight_button("add");
        auto_buffer = false;

    });

    document.getElementById('edit').addEventListener('click', () => {
        mode.changeState('edit')
        highlight_button("edit")

    });

    document.getElementById('delete').addEventListener('click', () => {
        mode.changeState('delete')
        highlight_button("delete")

    })

    document.getElementById('connect').addEventListener('click', () => {
        mode.changeState('connect')
        highlight_button("connect")

    })

    document.getElementById('move').addEventListener('click', () => {
        mode.changeState('move')
        highlight_button("move")

    })

    document.getElementById('change_status').addEventListener('click', () => {
        mode.changeState('change_status')
        highlight_button("change_status")

    })

    document.getElementById('disconnect').addEventListener('click', () => {
        mode.changeState('disconnect');
        highlight_button("disconnect")
    })

    document.getElementById('frame').addEventListener('click', () => {
        mode.changeState('frame');
        highlight_button('frame','menu-button')

      
    })

    document.getElementById('erase').addEventListener('click', () => {
        mode.changeState('erase');
        highlight_button('erase','menu-button'); 
    
    })

    document.getElementById('text_1').addEventListener('click', () => {
        mode.changeState('text');
        highlight_button('text_1','menu-button')

      
    })

    document.getElementById('edit_txt').addEventListener('click', () => {
        mode.changeState('edit_txt');
        highlight_button('edit_txt','menu-button')

      
    })

    document.getElementById('move_2').addEventListener('click', () => {
        mode.changeState('move_2');
        highlight_button('move_2','menu-button')

      
    })

    document.addEventListener('keydown', function (event) {
        // Check if the pressed key is the "Escape" key
        if (event.key === 'Escape' || event.keyCode === 27) {
            // Handle the "Escape" key press here
            console.log('Escape key pressed!');

             //cancel the frame action
            canvas.removeEventListener('mousemove', handleMouseMove_frame_draw);
            frame_point_start = null;
            final_frame_point = null;

            refresh_display();

            close_popup_info_display();

            open_popup_text_display('canceled');
            refresh_display();
            temporary_element_stored = null;

        }

        if (event.key === 'e') {
            mode.changeState('edit');
            highlight_button("edit");
        }

        if (event.key === 'a') {
            mode.changeState('add');
            highlight_button("add");
        }

        if (event.key === 'c') {
            mode.changeState('connect');
            highlight_button("connect");
        }

        if (event.key === 'm') {
            mode.changeState('move');
            highlight_button("move");
        }

    });

   


    btn_qmenu_button1.addEventListener('click', () => {
       
        if (btn_qmenu_button1.className === "menu-button"){
            btn_qmenu_button1.className = "menu-button active";
            console.log("Button1 active")
        }else{
            btn_qmenu_button1.className = "menu-button";
        }
    })

    btn_qmenu_button2.addEventListener('click', () => {
       
        if (btn_qmenu_button2.className === "menu-button"){
            btn_qmenu_button2.className = "menu-button active";
            console.log("Button2 active");
            refresh_display()

        }else{
            btn_qmenu_button2.className = "menu-button";
            refresh_display();
          

        }
    })

    btn_qmenu_button3.addEventListener('click', () => {
       
        if (btn_qmenu_button3.className === "menu-button"){
            btn_qmenu_button3.className = "menu-button active";
            console.log("Button3 active")

           
        }else{
            btn_qmenu_button3.className = "menu-button";
           

        }
    })

    btn_text_edit.addEventListener('click', () => {
        temporary_element_stored.text_value = el_text_input.value;
        open_popup_text_display('canceled');
        refresh_display();
        temporary_element_stored = null;


    });

    btn_text_cancel.addEventListener('click', () => {
        open_popup_text_display('canceled');
        refresh_display();
        temporary_element_stored = null;
    })

    btn_save.addEventListener('click', () => {
        console.log("Btn Save");
        file_save_mode = true
        el_open_dialog.style.display = "flex";
        btn_ok_file.hidden = false;
        el_userFileInput.hidden = false;
      


        el_fileInput.addEventListener('change', function () {

            if (file_save_mode){

                var pathParts = el_fileInput.value.split(/[\\\/]/);
                var fileName = pathParts[pathParts.length - 1];           
                el_userFileInput.value = fileName;
            }
          
            
        });


    });

    btn_load.addEventListener('click', () => {
        console.log("Btn load");
        file_save_mode = false;
        btn_ok_file.hidden = false;
        el_userFileInput.hidden = true;

        el_open_dialog.style.display = "flex";

      
      
    });

    btn_ok_file.addEventListener('click', () => {

        if (file_save_mode === true){
            if (el_userFileInput.value != ""){

                fileName = el_userFileInput.value;

                var regex = /\.\w+$/;

                // Test if the string has a file extension
                if (regex.test(fileName)) {
                    // Remove the file extension
                    fileName =  fileName.replace(regex, '');
                }
                
                el_userFileInput.value = fileName;  

                saveArrayToFile(list_of_nodes,list_of_frame_lines,list_of_text,fileName);
            }
        }else{
          
                loadArraysFromFile(el_fileInput);
                el_open_dialog.style.display = "none";
                el_fileInput.value=""


        }
           
        
    });

    btn_cancel_file_dialog.addEventListener('click', () => {
        el_open_dialog.style.display = "none";
        el_fileInput.value=""
    
    })


  
    checkbox1.addEventListener('click', () => {
        refresh_display();
    });

  

    //#endregion**************************************************************************
  

    //#region // capture change events like buttons clicked or element changes****************************************************

        //on calendar change,updade menu display
        el_calendar_1.addEventListener('change', function() {
        // Callback function to execute when the date changes
        
            el_node_date.value =  convert_date(el_calendar_1.value);
            el_days_count.value = 0;

        });

        //check if button add label was clicked
        btn_add_info.addEventListener('click', () => {
            console.log("Btn add info was clicked")

            mouse_position_val = {x:el_mouse_x_node.value,y:el_mouse_y_node.value};
            node_label_name_val = el_node_label.value;
            date_calendar_val = el_calendar_1.value;

            create_and_drawn_new_node(mouse_position_val,node_label_name_val,date_calendar_val)

            close_popup_info_display()


        })

        //check if button cancel menu popup label was clicked
        btn_cancel_info.addEventListener('click', () => {
            console.log("Btn cancel info was clicked")

            close_popup_info_display()


        })

        //update date if change days count
        el_days_count.addEventListener('change', function() {
            
            days_count = el_days_count.value;
            let formattedDate;

            if (el_calendar_1.value != ""){
            
                const currentDate = new Date(el_calendar_1.value);
                const newDate = new Date(currentDate.getTime() + days_count * 24 * 60 * 60 * 1000);
                // Format the new date as "YYYY-MM-DD" to match the input format
                formattedDate = newDate.toISOString().split('T')[0];
            
            
            }else{
                let today = new Date();
                console.log(today)
                formattedDate = today.toISOString().split('T')[0];
                const currentDate = new Date(formattedDate);
                const newDate = new Date(currentDate.getTime() + days_count * 24 * 60 * 60 * 1000);
                // Format the new date as "YYYY-MM-DD" to match the input format
                formattedDate = newDate.toISOString().split('T')[0];
            

            }  

            el_calendar_1.value = formattedDate
            //console.log(formattedDate)

            el_node_date.value = convert_date(formattedDate) 

        })

        btn_edit_info.addEventListener('click', () => {
            console.log("Btn edit info was clicked")
            current_node_select.label = el_node_label.value;
            current_node_select.date = el_node_date.value;
            current_node_select.date_calendar = el_calendar_1.value;


            current_node_selected = null;
            close_popup_info_display();

            refresh_display()


        });

        btn_clear.addEventListener('click', () => {
            list_of_nodes = [];
            auto_buffer = false;
            list_of_frame_lines = [];
            list_of_text = [];
            Node.resetIdCounter();
            refresh_display();
        });

        el_line_stroke.addEventListener('change', function() {


            let tmp_element = el_line_stroke;

            validate_interger_Input(tmp_element,1)
        });

        el_text_stroke.addEventListener('change', function() {


            let tmp_element = el_text_stroke;

            validate_interger_Input(tmp_element,10)
        });

        btn_text_add.addEventListener('click', () => {

            
            new_text = new Text_box(frame_point_start.x,frame_point_start.y,el_text_input.value,el_text_stroke.value,el_text_color.value);
              

            list_of_text.push(new_text)
            //console.log(list_of_text)

            //reset variables
            frame_point_start = null;
            
            popupBox_text_canvas.style.display = "none";
            
            refresh_display();


        })


            
    //#endregion****************************************************************************
  
    //listening to mouse click on canvas for action **************************************************
    canvas.addEventListener('mousedown', (event) => {

        //first, get current mouse position
        var mousePos = getMousePos(event);

        //perform a action according to current state

        if (mode.currentState === "add"){
            console.log("starting add node process")
            
            //first, check if the position choosen does not have any node
            if (get_node_from_position(mousePos) === null)
                //call a menu to input the node data
                open_popup_info_display("add","","",mousePos,"")
            else{
                console.log("Error, already have a node in this position")
            }

          
           
        }

        if (mode.currentState === "delete"){
            console.log("starting delete node process")
            //get the node cliked 
            let node = get_node_from_position(mousePos);

            if (node != null){

                let index = 0;

                for (const node_tmp of list_of_nodes) {

                    if (node_tmp.id === node.id){
                        //delete the node from the list
                        list_of_nodes.splice(index, 1);
                        break;
                    }

                    index += 1;
                }

                //shall remove this node from any linked array

                for (const node_tmp of list_of_nodes){
                    counter_= 0
                    for (const linked_node of node_tmp.linkedNodes){
                        //console.log(linked_node.id)

                        if (linked_node.id == node.id){
                            //console.log("node delete")
                            node_tmp.linkedNodes.splice(counter_,1)
                            
                        }
                        counter_ += 1
                    }
                }
            }

            refresh_display();

        }

        if (mode.currentState === "connect"){
            console.log("starting connect node process")

            //get the node cliked, -1 means not found
            let node = get_node_from_position(mousePos)
            //console.log(node_id)

            //if found a node, proceed
            if (node != null){
                
                //highlight the node selected
               
                drawCircle(node.x,node.y,std_radius,selected_color)

                current_node_select = node;

                canvas.addEventListener('mousemove', handleMouseMove_2);


                if (initial_line_node != null){

                    let node1 = initial_line_node
                    let node2 = node

                    connect_points(node1.x,node1.y,node2.x,node2.y)

                    node1.addLinkedNode(node2)

                    //case auto date is on
                    if (btn_qmenu_button3.className ===  "menu-button active"){
                    
                        //case the node has no fixed date
                        if(current_node_select.date_calendar === ""){
                            //copy the date of connected node
                            current_node_select.date_calendar = initial_line_node.date_calendar ;
                        }
            

                    }
    

                    //reset the highlight and all variables
                    initial_line_node = null
                    current_node_select = null
                    canvas.removeEventListener('mousemove', handleMouseMove_2);

                    refresh_display()  

                }else{
                    initial_line_node = node
                }

            }


        }

        if (mode.currentState === "move"){
            console.log("starting move node process")

            //get the node cliked
            let node = get_node_from_position(mousePos)

            if (moving === false){
                moving = true
            }else{
                moving = false
            }
            
 
            //if found a node, proceed
            if (node != null){
                if (initial_line_node == null){
                   
                    initial_line_node = node
                
                    drawCircle(node.x,node.y,std_radius,selected_color)

                    // Update the position of the circle based on mouse coordinates
                    // Add the event listener

                    current_node_select = node

                    canvas.addEventListener('mousemove', handleMouseMove);


                    //initial_line_node.hidden = true

                }
            }

            if (moving === false){

                    let new_position = stickToGrid(mousePos.x,mousePos.y,gridSize)
                    initial_line_node.x = new_position.x;
                    initial_line_node.y = new_position.y;
                  

                    //reset the highlight and all variables
                    initial_line_node.hidden = false;
                    initial_line_node = null
                    node = null
                    current_node_select = null
                    canvas.removeEventListener('mousemove', handleMouseMove);

                    refresh_display()  
            }              
           
        }
       
        if (mode.currentState === "change_status"){
            console.log("starting change_status node process")

            let current_node_selected = get_node_from_position(mousePos)
            
            //verifica se tem algun no selecionada
            if (current_node_selected != null){
                    //verify which status is and them change for the next

                let node_status = current_node_selected.status
                switch (node_status) {
                    case "Green":
                        current_node_selected.status = "Yellow";
                        break;
                    case "Yellow":
                        current_node_selected.status = "Red";
                        break;
                    case "Red":
                        current_node_selected.status = "Close";
                        break;
                    case "Close":
                        current_node_selected.status = "Green";
                        break;
                }



                refresh_display()
               
            }

        }

        if (mode.currentState === "disconnect"){
            console.log("starting disconnect node process")

            //get the node cliked 
            let node = get_node_from_position(mousePos)
            //console.log(node_id)

            //if found a node, proceed
            if (node != null && current_node_select === null){
                current_node_select = node;
                //highlight node
                drawCircle(current_node_select.x,current_node_select.y,std_radius,selected_color);

            }

            if (current_node_select != null && node.id != current_node_select.id){
                delete_connections(current_node_select,node.id);
                delete_connections(node,current_node_select.id);
                current_node_select = null;
                refresh_display()
            }



        }

        if (mode.currentState === "edit"){
            console.log("starting editing node process")

            //get the node cliked, -1 means not found
            let node = get_node_from_position(mousePos)
            //console.log(node_id)

            //if found a node, proceed
            if (node != null){

                current_node_select = node;
                open_popup_info_display("edit","","",mousePos,"");

               


            }



        }

        if (mode.currentState === "frame"){
            //console.log("Frame mode On")

            //check if there is a initial point, if not assign it
            if (frame_point_start === null){

                let new_pos = stickToGrid(mousePos.x,mousePos.y,(gridSize/2))
                frame_point_start = new_pos;
                canvas.addEventListener('mousemove', handleMouseMove_frame_draw);

            }else{

                canvas.removeEventListener('mousemove', handleMouseMove_frame_draw);

                //console.log(final_frame_point)


                new_frame_line = new Frame_line(frame_point_start.x,frame_point_start.y,final_frame_point.x,final_frame_point.y,el_line_stroke.value,el_line_type.value)

                list_of_frame_lines.push(new_frame_line)
                //console.log(list_of_frame_lines)

                //reset variables
                frame_point_start = null;
                final_frame_point = null;

              

            }

          

            //console.log(frame_point_start);

        }

        if (mode.currentState === "erase"){
            console.log("erase mode On");
            let line_found = false;

            let text_found = false;

            for (let index = 0; index < list_of_frame_lines.length; index++) {
                const line = list_of_frame_lines[index];
                
                let linestart = {x:line.x1, y:line.y1}
                let lineend = {x:line.x2, y:line.y2}
                

               line_found = (isPointNearLine(mousePos,linestart,lineend,10))

               if (line_found === true){

                    //console.log(list_of_frame_lines[index])
                    list_of_frame_lines.splice(index, 1);
                    refresh_display()
                    break;

               }
                
            }

            const rect = canvas.getBoundingClientRect();
            let pointX = mousePos.x - rect.left;
            let pointY = mousePos.y - rect.top;

            //console.log(pointX,pointY)

            let element_found = (get_element_from_position(pointX,pointY,"text"))

            if (element_found != null){

                console.log("Found a text to delete");

                for (let index = 0; index < list_of_text.length; index++) {
                    const tmp = list_of_text[index];

                    if (tmp.id === element_found.id){
                        list_of_text.splice(index, 1);
                        refresh_display()
                        break;

                    }
                }
             
            }

        }


        if (mode.currentState === "text"){
            console.log("Text mode On")

            btn_text_add.hidden = false;
            btn_text_edit.hidden = true;


            let new_pos = stickToGrid(mousePos.x,mousePos.y,(gridSize/2))
            frame_point_start = new_pos;
            open_popup_text_display("add")
              
       
        }

        if (mode.currentState === "edit_txt"){
            console.log("Edit text mode");
            btn_text_add.hidden = true;
            btn_text_edit.hidden = false;

            canvas.addEventListener("click", edit_text_capture);

           
        }else{
            canvas.removeEventListener("click", edit_text_capture);
        }

        if (mode.currentState === "move_2"){
        
            console.log("Move 2 working");
            let tmp_element = get_element_from_position(mousePos.x,mousePos.y);

            console.log("tmp_element",tmp_element)

            if (temporary_element_stored === undefined || temporary_element_stored === null){
                if (tmp_element != null){
                    //console.log(tmp_element);
                    temporary_element_stored = tmp_element;
                    
                    canvas.addEventListener('mousemove', handleMouseMove_element_move);
                }
            }

            if (moving === true){
                canvas.removeEventListener('mousemove', handleMouseMove_element_move);
                temporary_element_stored = null;
                moving = false;
            }

        }

    });
});