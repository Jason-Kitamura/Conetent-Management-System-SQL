const inquirer = require('inquirer');
require('events').EventEmitter.defaultMaxListeners = 15;

const orm = require( './ORM' );

async function main() {

//Start Inquirer asking user what they want to do
    const CMSinquirer = await inquirer.prompt([
        {name: "action", type: "list", message: "What you wanna do?", 
            choices:[ 'Add Department', 'Add Role', 'Add Employee',
                        'View Departments', 'View Roles', 'View Employees',
                            'Update Employee Info', 'Delete Employee'] }
    ]);

// calling function related to what the user decides to do
    if( CMSinquirer.action === 'Add Department' ) { addDepartment() }
    else if( CMSinquirer.action === 'Add Role' ) { addRole() }
    else if (CMSinquirer.action === 'Add Employee'){ addEmployee(); }
    else if( CMSinquirer.action === 'View Departments' ) { viewDepartments() }
    else if( CMSinquirer.action === 'View Roles' ) { viewRoles() }
    else if( CMSinquirer.action === 'View Employees' ) { getEmployees() }
    else if( CMSinquirer.action === 'Update Employee Info' ) { updateEmployeeRole() }
    else if( CMSinquirer.action === 'Delete Employee' ) { deleteEmployee() }

// Adds new Department
    async function addDepartment() {
    
        const newDepartment = await inquirer.prompt([
            {name: 'title', type: 'input', message: 'What is the department called?'}
            ]);   
        console.log("New Department Added: ", newDepartment );
        await orm.addDepartment( newDepartment );
        main ();
    }
// Gets department list and allows user to create a role associated with it
    async function addRole() {
    
        const departments = await orm.getDepartmentList();
    
        const newRole = await inquirer.prompt([
            {name: 'department', type: "list", message: 'What department is this role appart of?', choices: departments },
            {name: "title", type: 'input', message: 'What is the role title?'},
            {name: "salary", type: 'input', message: 'What is this roles salary? $____'}
        ]);
        console.log( 'New Role Added:', newRole );
        await orm.addRole( newRole );
        main();
    };
// Pulls roles and manager list, and adds new employee
    async function addEmployee(){

        const managers = await orm.getManagerList();
            managers.unshift( 'No Manager' );

        const roles = await orm.getRolesList();
        
        const newEmployee = await inquirer.prompt([
            {name: "firstName", type: "input", message: "What is their First Name?"},
            {name: "lastName", type: "input", message: "What is their Last Name?"},
            {name: "role", type: "list", message: "What is their role?", choices: roles },
            {name: 'manager', type: 'list', message: 'Who is their manager?', choices: managers }
        ]);
        const response = await orm.addEmployee( newEmployee );
        main();
    };

    //Functions to view Tables for departments, Roles, and Employees
    async function viewDepartments(){
        const departmentsTable = await orm.viewDepartments();
        console.table( departmentsTable );
        main();
    };
    async function viewRoles(){
        const rolesTable = await orm.viewRoles();
        console.table( rolesTable );
        main();
    };
    async function getEmployees(){
        console.log('getting employees')
        const employeesTable = await orm.viewEmployees();
        console.table( employeesTable );
        main();
    };
    //Function to delete Employee or Manager
    async function deleteEmployee() {
        const employees = await orm.getEmployeeList();
        const managers = await orm.getManagerList();
        const action = await inquirer.prompt([
            {type: 'list', name: 'role', message: 'Are they a Manager or Employee?', choices: ['Employee', 'Manager'] }
        ]);
        if ( action.role === 'Employee' ){
            const action = await inquirer.prompt([
                {type: 'list', name: 'name', message: 'Which Employee would you like to remove?', choices: employees }
            ]);
            const response = await orm.deleteEmployee( action.name )
            console.log( response );
        } else {
            const action = await inquirer.prompt([
                {type: 'list', name: 'name', message: 'Which Manager would you like to remove?', choices: managers }
            ]);
            const response = await orm.deleteManager( action.name )
            console.log( response );
        }
        main();
    };
 //function to update Employee Role or Manager
    async function updateEmployeeRole () {

        const emplyeeList = await orm.getEmployeeList();
//User Selects which Employee they wish to update;
        const employee = await inquirer.prompt([
            {type: "list", name: "name", message: "Who would you like to make changes to?", choices: emplyeeList }
        ]);
//User Selects if they want to update role or manager
        const employeeUpdate = await inquirer.prompt([
            {type: "list", name: "update", message: "What would you like to update?", choices: [ 'Role', 'Manager' ]}
        ]);
//Creating variables to pass to the ORM function
        let employeeName = employee.name;
        let updateType;
        let newInput;
//if user selects role:
        if (employeeUpdate.update === 'Role') {

            updateType = 'role_';
//get role list from database
            const roles = await orm.getRolesList();
                roles.push( 'Create New Role');
//asks users for now role/ create new role         
            const newRole = await inquirer.prompt([{type: 'list', name: 'newRole', message: 'What is their new role Title?', choices: roles}]);
//if user decides to create role, new role is creates and added to the Role table 
            if ( newRole.newRole === 'Create New Role'){
//Get department lsit from orm
                const departments = await orm.getDepartmentList();
                const createRole = await inquirer.prompt([
                    {name: 'department', type: "list", message: 'What department is this role appart of?', choices: departments },
                    {name: "title", type: 'input', message: 'What is the role title?'},
                    {name: "salary", type: 'input', message: 'What is this roles salary? $____'},
                ]);
                orm.addRole( createRole );
                newInput = createRole.title;
//call function to update employee info in database 
                const update = await orm.updateEmployee( employeeName, updateType, newInput);
            } 
//if user selects pre-existing role, info updated with existing role    
            else {
                newInput = newRole.newRole;
                const update = await orm.updateEmployee( employeeName, updateType, newInput);
                };
        }
//If user selects manager, manager info will be updated
            else if (employeeUpdate.update === 'Manager') { 

                updateType = 'manager_';
//get manager list with new option to add new manager
                const managers = await orm.getManagerList();
                managers.push( 'Add New Manager');
                
                const newManager = await inquirer.prompt([{type: 'list', name: 'newManager', message: 'Who is their new Manager?', choices: managers }]);
//If user chooses to add new manager, they can create a new manager. else choose existing manager
                if ( newManager.newManager === 'Add New Manager' ) {

                    const createManager = await inquirer.prompt([
                        {type: 'input', name: 'name', message: 'What is the name of the new Manager?'}
                    ]);
                    newInput = createManager.name;
                    orm.addManager( newInput );
                    const update = await orm.updateEmployee( employeeName, updateType, newInput);
                } else {
                    newInput = newManager.newManager;
                    const update = await orm.updateEmployee( employeeName, updateType, newInput);
                };
             };
        main();
    }  
}

main();



