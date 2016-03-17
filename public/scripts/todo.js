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

var sortByKey = function (array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

var DateInfo = React.createClass({
    render: function(){
        return (
            <span className="dateInfo date">
                {this.props.done_date ? 'Done @ '+this.props.done_date: 'Add @ '+this.props.date }
            </span>
        );
    }
});

var Todo = React.createClass({
  getInitialState: function(){
    return { id: '', done: ''};
  },
  toggleChecked: function(e) {  
    var checked = (e.target.checked) ? 'checked' : '',
        id = this.props.id;
    this.setState({ id: this.props.id, done: checked});
    this.props.onTodoCheck({ id:id, done: checked });
  },
  rawMarkup: function(){
    var rawMarkup = marked(this.props.children.toString(), {sanitize:true});
    return {__html: rawMarkup} ;
  },
  render: function(){
    return (
      <li className="todo">
        <input 
          type="checkbox" 
          checked={ this.state.done || this.props.done } 
          onChange={this.toggleChecked}
          onClick={this.handleTodoCheck}
          id={this.props.id} 
        />
        <span className="todoItem" dangerouslySetInnerHTML={this.rawMarkup()} />
        <DateInfo done_date={this.props.done_date} date={this.props.date}/>
      </li>
    );    
  }
});

var TodoBox = React.createClass({ 
  loadTodosFromServer: function(){
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data){
        var done_todos = data.filter(filterDone);       
        var undone_todos = data.filter(filterUnDone); 
        sortByKey(done_todos, 'newid');
        sortByKey(undone_todos, 'id');
        this.setState({done_todos : done_todos, undone_todos: undone_todos, data: data});
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleTodoSubmit: function(todo){
    var todos = this.state.data;
    console.log(todos);
    todo.id=Date.now();
    todo.done='';
    var newTodos = todos.concat([todo]);
    this.setState({data: newTodos});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: todo,
      success: function(data){        
        var done_todos = data.filter(filterDone);       
        var undone_todos = data.filter(filterUnDone);  
        sortByKey(done_todos, 'newid');
        sortByKey(undone_todos, 'id');
        this.setState({done_todos : done_todos, undone_todos: undone_todos, data: data});
      }.bind(this),
      error: function(xhr, status, err){
        this.setState({data: todos});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleTodoCheck: function(data){   
   $.ajax({
     url: '/api/modify',
     dataType: 'json',
     type: 'POST',
     data: data,
     success: function(data){
       var done_todos = data.filter(filterDone);       
        var undone_todos = data.filter(filterUnDone);        
        sortByKey(done_todos, 'newid'); //set done_todos order by newid
        sortByKey(undone_todos, 'id');  //set undone_todos order by id
        this.setState({done_todos : done_todos, undone_todos: undone_todos});
     }.bind(this),
     error: function(xhr, status, err){
       console.error(this.props.url, status, err.toString());
     }.bind(this)
   });
  },
  getInitialState: function(){
    return {undone_todos: [], done_todos: []};
  },
  componentDidMount: function(){
    this.loadTodosFromServer();
  },
  render: function(){
    return (
      <div className="todoBox">
        <TodoForm onTodoSubmit={this.handleTodoSubmit} />
        <h2>未做的</h2>
        <TodoList class = "todoList undone_todos" data = {this.state.undone_todos} onTodoCheck={this.handleTodoCheck} />
        <h2>做完啦</h2>
        <TodoList class = "todoList done_todos"  data = {this.state.done_todos} onTodoCheck={this.handleTodoCheck}/>       
      </div>
    );
  }
});

var TodoList = React.createClass({  
  render: function(){
    for(var i = 0; i < this.props.data.length; i++ ){
        this.props.data[i].handle_check = this.props.onTodoCheck;
    }
    var todoNodes = this.props.data.map(function(todo){
      return (
        <Todo key={todo.id} done={todo.done} date={todo.date} done_date={todo.done_date} id={todo.id} onTodoCheck={todo.handle_check}>
          {todo.text}
        </Todo>
      )
    }).reverse();
    return (
      <ul className= {this.props.class}>
        {todoNodes}
      </ul>
    )
  }
});


var TodoForm = React.createClass({
  getInitialState: function(){
    return {text:'', done:''};
  },
  handleTextChange: function(e){
    this.setState({text:e.target.value})
  },
  handleSubmit: function(e){
    e.preventDefault();
    var text = this.state.text.trim();
    if(!text){
      return;
    }
    this.props.onTodoSubmit({text:text});
    this.setState({text:''});
  },
  render: function(){
    return (
      <form className="totoForm" onSubmit={this.handleSubmit}>
        <input 
          type="text" 
          placeholder="要做什麼呢?"
          onChange={this.handleTextChange}
          value={this.state.text}
          className="todoInput"
          />
        <input type="submit" value="送出" className="todoSubmit" />
      </form>
    )
  }
})


ReactDOM.render(
  <TodoBox url='/api/todos' pollInterval={2000}/>,
  document.getElementById('content')
)