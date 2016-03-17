/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var TODOS_FILE = path.join(__dirname, 'todos.json');

var i = 0;
var filterDone = function(obj) {
  if ('done' in obj && obj.done === 'checked' ) {
    return true;
  } else {
    i++;
    return false;
  }
}

var filterUnDone = function(obj) {
  if ('done' in obj && obj.done === '' ) {
    return true;
  } else {
    i++;
    return false;
  }
}

var formatDate = function(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes
      year = date.getFullYear(),
      mounth = date.getMonth()+1,
      day = date.getDate();
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return year + "/" + mounth + "/" + day + "  " + strTime;
}

var d = new Date(),
    e = formatDate(d);

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest todo.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/todos', function(req, res) {
  fs.readFile(TODOS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/todos', function(req, res) {
  fs.readFile(TODOS_FILE, function(err, data) {    
    var d = new Date();
    var e = formatDate(d);    
    
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var todos = JSON.parse(data);
    // NOTE: In a real implementation, we would likely rely on a database or
    // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
    // treat Date.now() as unique-enough for our purposes.
    
    var newTodo = {
      id: Date.now(),
      text: req.body.text,
      done: '',
      date: e
    };
    todos.push(newTodo);
    fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(todos);
    });
  });
});

app.post('/api/modify', function(req, res) {
  fs.readFile(TODOS_FILE, function(err, data) {    
    var id = parseInt(req.body.id,10),  
        done = req.body.done,      
        i = 0,
        filterByID = function(obj) {
          if ('id' in obj && typeof(obj.id) === 'number' && !isNaN(obj.id) && obj.id === id) {
            return true;
          } else {
            i++;
            return false;
          }
        };
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var todos = JSON.parse(data);  
    var indexs = todos.map(function(obj, index) {
                   if(obj.id == id) {
                     return index;
                   }
                 }).filter(isFinite);
    if (id) {              
        var modifiy_todos = todos.filter(filterByID);
        if(modifiy_todos.length > 0){
               modifiy_todos[0].done = done;
            if(done){                
                modifiy_todos[0].newid = Date.now();
                modifiy_todos[0].done = done;
                modifiy_todos[0].done_date = e;            
            }else{
                //undone again after done
                modifiy_todos[0].id = Date.now();
                modifiy_todos[0].newid = '';
                modifiy_todos[0].done_date = '';                  
            }
            todos.splice(indexs[0],1,modifiy_todos[0]);            
        }
    }  
    fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }      
      res.json(todos);
    });
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
