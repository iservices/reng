# reng

This package is currently in **BETA**

## Overview
This is a node package that contains an implementation of the flux pattern using Angular2 and the redux package.

## Guide

To install this package execute the following command in the console from within your project.
```
npm install --save reng
```

This package is a collection of classes that loosley correspond to each of the items defined in the flux pattern.
A short description of each class in this package is below.  See the API section for more detailed information on each class.

- `Page` - The main entry point which is used for launching an application.
- `View` - Corresponds to a flux view component.
- `Reducer` - Contains all of the business logic for managing data.
- `PageBuilder` - Used on the server side to generate pages as well as for unit testing.

### Example Application

What follows is an example of an application built using this package.  
For this example I will create an application that allows a user to log questions with a subject and body input.
Note that you will need to use a bundle and transpiler package to transpile from ECMAScript6/TypeScript and 
deliver your code to the client which is not shown in the examples.

#### Reducer
The first thing I'll do is define a reducer for my application.  For this example the reducer is simply going to save and retrieve data from 
memory but normally there would be some kind of communication with a backend service.
Below is code that I've put in a file named `questionReducer.js`:
```JavaScript
import Reng from 'reng';

export default class QuestionReducer extends Reng.Reducer {

  constructor() {
    this.mQuestionIdNext = 0;
  }

  actionAddQuestion(state, action) {
    return [...state, {
      id: ++this.mQuestionIdNext,
      subject: action.subject,
      body: action.body
    }];
  }
}
```

As you can see above the QuestionReducer class code is pretty simple.
The name given to the actionAddQuestion function has significance as it begins with the text `action`.  Any function defined in a Reducer class 
that begins with the text action will be called automatically by the dispatcher when the text that follows action
is set in `type`.
For my example this function gets executed whenever a dispatch is sent with the action.type set to `AddQuestion`.

You can also use action types with periods if you want.  These get translated into underscores in function names.  For eaxmple the action 
`.My.Example.Action` will map to the function `action_My_Example_Action`.

#### View
Now that I have my Reducer defined I'm going to define what will be displayed for UI on the page.  To do this I'm going to break up the different parts of my 
display into a couple of different views.
First up I'll write the view for displaying questions that have been added.  This code will be in a file called `QuestionListView.js`:
```JavaScript
import Reng from 'reng';

@Reng.Component({
  selector: 'QuestionListView',
  template: `<div>
    <div *ngFor="let question of input">
      <b>{{question.subject}}</b> - {{question.body}}
    </div>
  </div>`
})
export default class QuestionListView extends Reng.View {
}
```
This class extends Reng.View and uses the Reng.component annotation.  Reng.Component is equivalent to @angular/core/Component but
it adds some additional logic.  For example the change detection strategy will be set to OnPush by default.
Now that I've defined the view for displaying questions I'll define the view for adding questions in a file named `QuestionAddView.js`:
```JavaScript
import Reng from 'reng';

@Reng.Component({
  selector: 'QuestionAddView',
  template: `<div>
    <form>
      <input id="questionSubject" [(ngModel)]="data.subject" type="text" placeholder="subject" />
      <input id="questionBody" [(ngModel)]="data.body" type="text" placeholder="body" />
      <button id="questionAdd" type="button" (click)="handleClick()">Create</button>
    </form>
  </div>`
})
export default class QuestionAddView extends Reng.View {

  handleClick() {
    // emit an addQuestion event
    this.emit(
      'AddQuestion',
      {
        subject: this.data.subject,
        body: this.data.body
      });

    // clear out inputs after creating question
    this.data.subject = '';
    this.data.body = '';
  }
}
```
There are a number of things going on in the code above.  First, the user input is being stored in the local data object of the view and the data is 
tied to the text input boxes through the template.  
You'll also notice that the handleClick function is raising an event using the emit function defined in the
base View class.  The emit function will raise an Angular2 event by default or it can be configured to dispatch a Redux message.

#### App View
Now that I've defined all of the views I'll need I can create a class that will bring them together to be displayed.
I'll do this with another View I'll define in a file named `QuestionAppView.js`:
```JavaScript
import Reng from 'Reng';
import QuestionListView from './questionListView';
import QuestionAddView from './questionAddView';
import QuestionReducer from './questionReducer';

@Reng.Component({
  selector: 'QuestionAppView',
  template: `<div>
    <QuestionAddView [emitter]="{ type: 'DISPATCH' }"></QuestionAddView>
    <div>Size: <span id="questionSize">{{input.questions.length}}</span></div>
    <QuestionListView [input]="input.questions"></QuestionListView>
  </div>`,
  directives: [QuestionAddView, QuestionListView],
  reduce: { questions: QuestionReducer }
})
export default class QuestionAppView extends Reng.View {
}
```
As you can see the QuestionAppView class extends the Reng.View class.
In this class I've brought together the QuestionAddView and QuestionListView views and I am displaying the one on top of the other.
The emitter for the QuestionAddView is configured so that events will be dispatched to the Redux store instead of being raised as an Angular2 event.
I've also defined a reduce function for the view using the reduce parameter.  This decorator will create a reduce 
function that returns a state that includes a questions property that is set to the results from a call to an instance of
the QuestionReducer class.

#### Page

Now that I have all the parts needed for my application I can render it into a page.  First I'll use the PageBuilder to generate
html that will be rendered on the browser.  I will also need to write some code to have my app load when the browser loads the page.

The following is the code needed to generate html for the browser.
```JavaScript
import PageBuilder from 'reng/lib/local/pageBuilder';
import QuestionAppView from './questionAppView';

const pb = new PageBuilder();
pb.scripts = ['<script src="myscripts.js"></script>']; // this would be set with the scripts that load the application
const html = pb.renderToTemplate(QuestionAppView, { questions: [] });
```
The value that is held in the html variable is a string that is the rendered value of the QuestionAppView page which would then
be returned from a server call or maybe written out to an html file to ultimately be loaded into a browser.

This is the code that is needed in order to load the application when the page loads.  It should be included in the scripts
that are rendered by the PageBuilder class in the example above.
```JavaScript
import Reng from 'reng';
import QuestionAppView from './questionAppView';

Reng.Page.load(QuestionsAppView).then(page => {
  console.log('the page has been loaded');
});
```
The Reng.Page.load function returns a promise that will resolve with the page that has been loaded.

## API

## **Page** (class)
Page objects are created from calls to Page.load which create a new Page instance with the specified View loaded.

### *Members*

## title : `String`  
This is a property that corresponds to the title displayed in the browser.  It can be both read from and updated.

### *Functions*

## navigate(url) ⇒ void
Navigate to the given url when in the browser context.  If not in the browser context this function will have no effect.  

**Parameters:**  

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| url | `String` | | The url to navigate to. |

**Returns:** `void`

## (static) load(view, inputᵒᵖᵗ, optsᵒᵖᵗ) ⇒ Promise
This is a static function that creates a new page instance with the given view and loads it.

**Parameters:**  

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| view | `View` | | The view to load into the page. |
| input | `Object` | optional | The input for the view that is loaded. |
| opts | `Object` | optional | Options for the page. |
| opts.title | `String` | optional | The title for the page. |

**Returns:** `Promise`  
The promise that is returned will resolve with the instance of the page that is loaded.

## (static) setConfig(opts) ⇒ void
This function is used to set configuration for any pages that are created in the future.
This is useful for setting mock data options.

**Parameters:**

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| opts | `Object` | | The configuration options.  This is the same as the options provided to the load function. |

**Returns:** `void`

## (static) bootstrap(view, inputᵒᵖᵗ, optsᵒᵖᵗ) ⇒ Promise
This function calls the static load method but only when in the browser context.  All of the parameters are passed through.

**Parameters:**  

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| view | `View` | | The view to load into the page. |
| input | `Object` | optional | The input for the view that is loaded. |
| opts | `Object` | optional | Options for the page. |
| opts.title | `String` | optional | The title for the page. |

**Returns:** `Promise`  
The promise that is returned will resolve with the instance of the page that is loaded.

## tick() ⇒ void
This function is used to manually run a check for any changed state on the page.

**Returns:** `void`
  
  

## **View** (class)
Abstract definition of a View.
View classes are not intended to be used directly but rather to be extended by other classes to provide custom logic.

### *Members*

## errors : `Errors`
The service used to handle errors.

## debug : `Debug`
The debug client used by the application.

## input : `Object`
This property will hold an immutable state object that is passed in from the container of the view and will
contain input values for the view.  Defaults to an empty object.

## data : `Object`
This property is used to store state that is local to the view.  Defaults to an empty object.

## emitter : `Object`
An object used to configure how the view will emit events.  It can have three properties:  
- type: One of the following strings: EVENT, DISPATCH, BOTH.  The default is EVENT which raises Angular2 events on the output parameter.
        DISPATCH will dispatch events to the Redux store.  BOTH will raise Angular2 events and dispatch Redux messages.
- map: An object that maps event names in the view to new event names.  For example if a view has an 'add' event then you can change this
       to 'AddQuestion' by setting map to { 'add': 'AddQuestion' }.
- context: Any value provided here will be set on the event that is raised and can be used to provided additional context.

### *Functions*

## reduce(state, action) ⇒ Object
When this function is defined for a root level view it will be called by the system in response to actions that are dispatched.
It will take precedence over a reduce function that is defined in metadata with the Reduce decorator.

**Parameters:**  

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| state | `Object` | | The current state in the application. |
| action | `Object` | | The action to perform on the state.  The type property of the action is used to uniquely identify the action. |

**Returns:** `Object`
The new state after the given action has been performed.

## onInit() ⇒ void
This function is called by the framework when the view has been initialized.

**Returns:** `void`

## onDestroy() ⇒ void
This function is called by the framework when the view has been destroyed.

**Returns:** `void`

## createReducer(Type, initialStateᵒᵖᵗ) ⇒ Reducer
This function creates and configures the base Reducer class for the given Reducer type.

**Parameters:**  

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| Type | `Class` | | The type of Reducer to create. |
| initialState | `Object` | optional | The initial state the reducer should return to start. | 

**Returns:** `Reducer`
The reducer of the given type.

## emit(eventName, eventArgsᵒᵖᵗ) ⇒ void
Use the function to emit an event.  The way in which the event is raised can be configured by parent views.

**Parameters:**  

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| eventName | `String` | | The event name. |
| eventArgs | `Object` | optional | Arguments to pass with the event. | 

**Returns:** `void`

## subscribe(map, targetᵒᵖᵗ, event) ⇒ void
This function is used to subscribe to events raised through the output event emitter of a view.  
Example:
```
<MyElement (output)="subscribe('change', onChange, $event)"></MyElement>
<MyElement (output)="subscribe({ 'change': onChange, 'focus': onFocus }, $event)"></MyElement>
```

**Parameters:**  

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| map | `String or Object` | | If a string then the name of the event to subscribe to.  If an object then it's a map of event name to function to call. |
| target | `Function` | optional | When map is a string then this is the function that is called when the named event is raised. |
| event | `Event` | | The event that has been raised | 

**Returns:** `void`
  
  

## *Reduce* (decorator)
This decorator is used to define the reduce function to be used on a root level view.
The following example shows the decorator being used to define a reduce function that will
return a new state object with the count property on that object set to the result from calling the reduce function
on an instance of CountReducer and the name property on that object set to the result from calling the reduce function
on an instance of NameReducer.
```JavaScript
@Reng.Reduce({
  count: CountReducer,
  name: NameReducer
})
export default class MyView {
}
```
  


## *Event* (object)
Events that are raised using the emit funciton in View will be an Event object.

### *Members*

## type: `String`
The name of the event.

## args: `Object`
The arguments for the event provided by the View.

## sender: `View`
The view that raised the event.

## context: `Object`
Context provided by the parent of the View that raised the event.
  
  
  
## *Reducer* (class)
This class is a base class for all Reducer classes.
It is not intended to be used directly but rather to be extended by other classes to provide custom logic.
Classes that override this class can wire up functions to be called when a given action is dispatched.
Any function that has a name that begins with the text action will be wired up to the corresponding action name.

#### Reducer.constructor(opts)
Type: `Function`

The constructor for reducer classes.

##### options
Type: `Object`

The options for the reducer.

##### options.initialState
Type: `Object`

When this is set it will be returned from calls to the initialState function of this class.

### *Members*

## page: `Page`
The page this view belongs to.

## errors : `Errors`
The service used to handle errors.

## store : `Store`
The store used by the application.

## http: `Http`
The http client used by the application.

## storage : `Storage`
The storage client used by the application.

## debug : `Debug`
The debug client used by the application.

## appInput : `Object`
The input for the application.

## *Functions*

## initialState() ⇒ Object
This function will return the value passed into the constructor of this class by default.  It can also be overridden
by sub classes to provide a different behavior.

**Returns:** `Object`
Defaults to the value passed into the constructor of this object or an empty object if no value was provided in constructor.
  
  
  
## **PageBuilder** (class)
This class is intended to be used on the server to render Pages on the server to be delivered to client browsers.

## *Members*  

## styles : `String or String[]`
A property that contains the style sheet tags that should be included in the page.

## scripts : `String or String[]`
A property that contains the script tags that should be included in the page.

## baseUrl : `String`
A property that contains the base url for the page.  Defaults to '/'.

## *Functions*  

## renderToTemplate(view, inputᵒᵖᵗ) ⇒ String
This function generates an HTML string that will load the given page when the HTML is loaded in a browser.

**Parameters:**

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| view | `View` | | The view to render. |
| input | `Object` | optional | The input for the view. |

**Returns:** `String`
The HTML that will load the given view.

## (static) renderToTemplate(opts) ⇒ String
A static version of the renderToTemplate instance function.

**Parameters:**

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| opts | `Object` | | Options for the function. |
| opts.view | `View` | | The view to render. |
| opts.input | `Object` | optional | Input to render the view with. |
| opts.styles | `String or String[]` | optional | Style sheet tags for the page. |
| opts.scripts | `String or String[]` | optional | Script tags for the page. |
| opts.baseUrl | `String` | optional | The base url for the page. |

**Returns:** `String`
The HTML that will load the given view.

## (static) test(type, inputᵒᵖᵗ, optsᵒᵖᵗ) ⇒ Promise
This function is used to help with unit testing of views and reducers.  It returns a promies that resolves with the
loaded view or reducer.

**Parameters:**

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| type | `View or Reducer` | | The view or reducer to load for testing. |
| input | `Object` | optional | The input for the loaded view or reducer. |
| opts | `Object` | optional | The options for the application. |
| opts.errors | `Function` | optional | A function that will be called instead of the built in handle function in the Errors service.
| opts.storage.session | `Object` | optional | Values to set for session storage. |
| opts.storage.local | `Object` | optional | Values to set for local storage. |
| opts.store.action | `Object or Function` | optional | This is used to listen to the application state after certain actions have been dispatched and finished being processed.  If this is an object then any function on the object that matches the name of an action that has been processed will be called with an object that includes the current state and the name of the action that was executed.  If it is a function then that function will be executed whenever any action has been processed and will be passed the current state and the name of the action that was executed. |
| opts.store.reducer | `Object` | optional | When this is set to an object it will override reducing actions.  Set a property on this object to the same name as an action.type and it will be used instead of the normal reducing function.  The property can be a reducing function or an object which will be merged with the current state. |
| opts.http.request | `Object or Function` | optional | This is used to override results that would normally come back from a call to Http.request.  See below for a more details. |

For the `opts.http.request` option, when it is a function then
it must match the signature and return type of the Http.request function as it will be used instead.  
  
When it is an Object then the property names will be matched up with the method and url for calls to the Page.request function.
The following table describes how to create mappings with property names and are ordered by the precedence:
- `'GET:http://fake.org/'` will be used when `Http.request({ method: 'GET', url: 'http://fake.org' })` is called.
- Any property that begins with a `/` will be treated as a javascript regular expression and used to match against requests that are formatted as a string in the form *METHOD*:*URL*.
- `'GET:*'` will be used when any calls to Http.request have `method: 'GET'`.
- `'*'` will be used for any calls to Http.request that don't have any other match.  
  
Each property can be any one of the following:  
  
- A function which must match the signature and return type of the Page.request function as it will be used instead.
- An object that has a property named `reject` which will be returned with Promise.reject.
- An object that has a property named `resolve` which will be returned with Promise.resolve.
- An object with neither reject or resolve properties which will be returned with Promise.resolve.  |
  
**Returns:** `Promise`
A promise that resolve to the page that is loaded for the test.
  

  
## **Errors** (class)
This class contains all of the logic for handling errors that may occur.

## *Functions*

## handle(err) ⇒ void
Handle the given error.

**Parameters:**

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| err | `Error or string` | | The error to handle.  If this is not a truthy value it will be ignored. |

**Returns:** `void`
  


## **Store** (class)
This class contains all of the logic for interacting with a redux store.

## *Functions*

## getState() ⇒ Object
Get the current state object from the store.

**Returns:** `Object`  
The current state in the store.

## dispatch(action) ⇒ void
Dispatch an action in an asynchronous fashion.

**Parameters:**

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| action | `Object` | | The action to dispatch.  The type property is used to route the action to the appropriate function. |

**Returns:** `void`

## dispatchSync(action) ⇒ void
Dispatch an action in a synchronous fashion.

**Parameters:**

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| action | `Object` | | The action to dispatch.  The type property is used to route the action to the appropriate function. |

**Returns:** `void`
  
  
  
## **Http** (class)
This class is used to make http requests.

## *Functions*

#### request(opts) ⇒ Promise
Execute an http request.  This will return a promise that resolves to the resulting object if the response has a content
type of application/json otherwise it will resolve with the completed XMLHttpRequest.

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| opts | `Object` | | The options for the request. |
| opts.method | `String` | | The type of http method.  i.e. GET, POST, PUT, etc. |
| opts.url | `String` | | The url for the request. |
| opts.body | `String or Object` | optional | The body for the request.  If this is a string it is sent as is in the body.  If it is an object then it will be stringified and the content type will be set to application/json. |
| opts.headers | `String[]` | optional | An array of header objects for the request that each must have a key and value parameter. |
| opts.responseType | `String` | optional | The type of response to return. |
| opts.format | `Function` | optional | This function will be called with the result of a sucessful call and the return from this function will be what is resolved in the promise. |
  


## **Storage** (class)
The storage functions for the application.

## *Members*

## local : `Storage`
The storage container for local data.

## session : `Storage`
The storage container for session data.
  


## **Debug** (class)
A classed used for debugging.

## *Functions*

## log(category, title, text) ⇒ void
Create a new log entry.

**Parameters:**  

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| category | `String` | | The category to create debug entries under. |
| title | `String` | | The title to give the log. |
| text | `String` | | The text to log. |

**Returns:** `void`

## logger(category) ⇒ Logger
Create a logger for the given category.

**Parameters:**  

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| category | `String` | | The category the logger will log entries under. |

**Returns:** `Logger`
A function that can be used to create logs under the given category without having to specify the category with each call.