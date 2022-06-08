//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-albi:test123@cluster0.1atdzwe.mongodb.net/todolistDB",{useNewUrlParser: true});
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name:"Welcome to your todolist!"
});
const item2 = new Item({
  name:"Hit the + button to aff a new item."
});
const item3 = new Item({
  name:"<-- hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};
const List = mongoose.model("List",listSchema);
app.get("/", function(req, res) {


Item.find({}, function(err, foundItems){
  if(foundItems.length===0){
    Item.insertMany(defaultItems, function(err){
    if(err){
    console.log(err)
     }
    else{
    console.log("Succesful inserted!!")
    }});
  res.redirect("/");}
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
  });
 
});
app.get("/:costumListName", function(req, res){
  const costumListName= _.capitalize(req.params.costumListName);
  List.findOne({name:costumListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name:costumListName,
          items:defaultItems
        });
      list.save();
      res.redirect("/"+costumListName);
     
      }
      else{
        //Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
  
});




app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName==="Today"){
  item.save();
  res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});
app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const listName= req.body.listName;
  if(listName==="Today"){ 
  Item.findByIdAndRemove(checkedItem, function(err){
    if(!err){
    console.log("Succesfully")
      res.redirect("/");
    }
  });
}
else{
   List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItem}}}, function(err, foundList){
     if(!err){
       res.redirect("/"+listName);
     }
   });
}
});



app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if(port==null|| port == ""){
  port=3000
}

app.listen(port, function() {
  console.log("Server started succefully");
});
