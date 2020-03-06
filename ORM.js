const mysql = require( 'mysql' );

class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }
    query( sql, args=[] ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
  }
const db = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "rootroot",
    database: "cms"
});

//Functions to get lists and return to CMS
async function getDepartmentList () {
    const rawList = await db.query( "SELECT name FROM department" );
    const stringList = JSON.stringify( rawList );
    const departmentList = JSON.parse( stringList ); 

    const departments = [];

    departmentList.forEach( function ( department ){
        departments.push( department.name );
    });
    return departments;
};

async function getRolesList () {
    const rawList = await db.query( "SELECT title FROM roles" );
    const stringList = JSON.stringify( rawList );
    const roleList = JSON.parse( stringList ); 

    const roles = [];

    roleList.forEach( function ( role ){
        roles.push( role.title );
    });
    return roles;
};

async function getManagerList () {
    const rawList = await db.query( "SELECT first_name FROM managers" );
    const stringList = JSON.stringify( rawList );
    const managerList = JSON.parse( stringList );

    const managers = [];

    managerList.forEach( function ( manager ){
        managers.push( manager.first_name );
    });
    return managers;
};

async function getEmployeeList () {
    const employees = [];
    const rawList = await db.query( "SELECT first_name FROM employees" );
    const stringList = JSON.stringify( rawList );
    const employeeList = JSON.parse( stringList ); 

    employeeList.forEach( function ( employee ){
        employees.push( employee.first_name );
    });
    return employees;
};

// Functions to add departments, roles, managers and employees
async function addDepartment( d ){
    const myResult = await db.query( 
        "INSERT INTO department ( name ) VALUES(?)",
        [ d.title ] );
    return myResult;
};

async function addManager ( e ){
    const myResult = await db.query(
        "INSERT INTO managers ( first_name ) VALUES(?)",
            [ e ] );
    return myResult
}

async function addRole( r ){
    const myResult = await db.query( 
        "INSERT INTO roles ( title, salary, department) VALUES(?,?,?)",
        [ r.title, r.salary, r.department ] );
    return myResult;
};

async function addEmployee( e ){

    const myResult = await db.query( 
        "INSERT INTO employees ( first_name, last_name, role_, manager_ ) VALUES(?,?,?,?)",
            [ e.firstName, e.lastName, e.role, e.manager ] );

    return myResult;
};

//functions to view department, role, and employee tables
async function viewDepartments() {
    const departmentTable = await db.query(
        "SELECT * FROM department"
    );
    return departmentTable;
};

async function viewRoles() {
    const rolesTable = await db.query(
       "SELECT * FROM roles"
   );
   return rolesTable;
};

async function viewEmployees() {
    console.log('in view employees')
    const employeesTable = await db.query(
       "SELECT * FROM employees LEFT JOIN roles ON role_ = title;"
   );
   console.log(employeesTable);
   return employeesTable;
};

//function to update employee info (takes in employee name, column, and input value)
async function updateEmployee ( name, column, input ){
    const update = await db.query(
        `UPDATE employees SET ${column} = '${input}' WHERE first_name = '${name}';`
    )
}

//function to delete Employee from table
async function deleteEmployee( name ) {
    await db.query(
        `DELETE FROM employees WHERE first_name = '${name}';`
    );
    return `Deleted employee: ${name}`;
};
//function to delete manager from table
async function deleteManager( name ) {
    await db.query(
        'DELETE FROM managers' + ` WHERE first_name = '${name}';`
    );
    return `Deleted Manager: ${name}`;
};
//export funnctions
module.exports = { 
    addDepartment,
    addRole,
    addManager,
    addEmployee,
    getDepartmentList,
    getRolesList,
    getManagerList,
    getEmployeeList,
    viewDepartments,
    viewRoles,
    viewEmployees,
    updateEmployee,
    deleteEmployee,
};