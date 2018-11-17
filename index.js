let userPool
let cognitoUser

const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool
const userAttribute   = AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute


const setUserPool = poolData => {
    const {UserPoolId, ClientId} = poolData
    
	sessionStorage.UserPoolId = UserPoolId
	sessionStorage.ClientId   = ClientId
	formConfig.UserPoolId.value = UserPoolId
	formConfig.ClientId.value = ClientId

	try {
		userPool = new AWSCognito
			.CognitoIdentityServiceProvider
			.CognitoUserPool(poolData)
	} catch (err) {
		console.error(err)
		return false
	}

	return true
}
const setupUserPool = () => {
    if (formConfig['UserPoolId'].value &&
    formConfig['ClientId'].value) {
		setUserPool()
		return true
	}

	if (sessionStorage.PoolId &&
		sessionStorage.ClientId) {
            formConfig['UserPoolId'].value = sessionStorage
			.UserPoolId

            formConfig['UserPoolId'].value = sessionStorage
			.UserPoolId

		setUserPool()
		return true
	}

	return false
} 

const configure = event => {
    event.preventDefault()

	const UserPoolId = formConfig['UserPoolId'].value
	const ClientId = formConfig['ClientId'].value

	sessionStorage.PoolId = UserPoolId
	sessionStorage.ClientId = ClientId

	const poolData = {
		UserPoolId,
		ClientId
	}

	const configured = setUserPool(poolData)

	if (configured) {
		alert('UserPool configured')
	}
};

formConfig.onsubmit = configure;

// sign up - (Cognito should have a clinet with web)
/ Normal User Flow Forms

const signup = event => {
	event.preventDefault()

	if (!userPoolIsConfigured()) {
		userPoolWarning()
	}

	const birthdate = signupForm['birthdate'].value
	const email = signupForm['email'].value
	const gender = signupForm['gender'].value
	const name = signupForm['name'].value
	const password = signupForm['password'].value
	const phoneNumber = signupForm['phone_number'].value

	// console.log(birthdate)
	// console.log(email)
	// console.log(gender)
	// console.log(name)
	// console.log(password)
	// console.log(phoneNumber)

	const userAttributes = [
		new userAttribute({
		    Name: 'name',
		    Value: name
		}),

		new userAttribute({
		    Name: 'email',
		    Value: email
		}),

		new userAttribute({
		    Name: 'phone_number',
		    Value: phoneNumber
		}),

		new userAttribute({
		    Name: 'birthdate',
		    Value: birthdate
		}),

		new userAttribute({
		    Name: 'gender',
		    Value: gender
		}),
	]

    const errors = signupFormgi
    	.getElementsByClassName('errors')[0]
    const success = signupForm
    	.getElementsByClassName('success')[0]

	userPool.signUp(email, password, userAttributes, null, (err, result) => {
	    if (err) {
	    	success.innerHTML = ''
	    	errors.innerHTML = err
	        return
	    }

	    errors.innerHTML = ''
	    success.innerHTML = JSON.stringify(result, null, 2)
	})

	return false
}

signupForm.onsubmit = signup


// All users need to confirm the email via code or Link

const confirmRegistration = event => {
	event.preventDefault()

	if (!userPoolIsConfigured()) {
		userPoolWarning()
	}

	const email = confirmRegistrationForm['email'].value
	const code = confirmRegistrationForm['code'].value

	console.log(email)
	console.log(code)

    if (!cognitoUser) {
		const userData = {
	        Username : email,
	        Pool: userPool
	    }

		cognitoUser = new AWSCognito
			.CognitoIdentityServiceProvider
			.CognitoUser(userData)
    }

    const errors = confirmRegistrationForm
    	.getElementsByClassName('errors')[0]
    const success =confirmRegistrationForm
    	.getElementsByClassName('success')[0]

	cognitoUser.confirmRegistration(code, true, (err, result) => {
	    if (err) {
	    	success.innerHTML = ''
	    	errors.innerHTML = err
	        return
	    }

	    errors.innerHTML = ''
	    success.innerHTML = JSON.stringify(result, null, 2)
	})

	return false
}

confirmRegistrationForm.onsubmit = confirmRegistration