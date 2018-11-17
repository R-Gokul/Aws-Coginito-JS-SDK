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

	if (sessionStorage.UserPoolId &&
		sessionStorage.ClientId) {
            formConfig['UserPoolId'].value = sessionStorage
			.UserPoolId

            formConfig['ClientId'].value = sessionStorage
			.ClientId

		setUserPool()
		return true
	}

	return false
} 

const configure = event => {
    event.preventDefault()

	const UserPoolId = formConfig['UserPoolId'].value
	const ClientId = formConfig['ClientId'].value

	sessionStorage.UserPoolId = UserPoolId
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

const IsConfigured = () => {
	if (userPool)  {
		return true
	}

	return setupUserPool()
}

// sign up - (Cognito should have a clinet with web)

const signup = event => {
	event.preventDefault()

	if (!IsConfigured()) {
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

    const errors = signupForm
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

const confirm = event => {

	alert('test');
	event.preventDefault()

	if (!IsConfigured()) {
		userPoolWarning()
	}

	const email = confirmUser['email'].value
	const code = confirmUser['code'].value

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

    const errors = confirmUser
    	.getElementsByClassName('errors')[0]
    const success =confirmUser
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

confirmUser.onsubmit = confirm


//Sign In

const SignIn = event =>  {
	event.preventDefault()

	if (!IsConfigured()) {
		userPoolWarning()
	}

	const form = SignInForm

	const email = form['email'].value
	const password = form['password'].value

	const identityPoolId = formConfig['UserPoolId'].value
	const clientId = formConfig['ClientId'].value

	console.log(email)
	console.log(password)

    const authenticationData = {
        Username : email,
        Password : password,
    }

    const authenticationDetails = new AWSCognito
		.CognitoIdentityServiceProvider
		.AuthenticationDetails(authenticationData)

    if (!cognitoUser) {
		const userData = {
	        Username : email,
	        Pool: userPool
	    }

		cognitoUser = new AWSCognito
			.CognitoIdentityServiceProvider
			.CognitoUser(userData)
    }

    const errors = form.getElementsByClassName('errors')[0]
    const success = form.getElementsByClassName('success')[0]

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: result => {

            success.innerHTML = ('access token + ' + result.getAccessToken().getJwtToken())

            // POTENTIAL: Region needs to be set if not already set previously elsewhere.
            // AWS.config.region = '<region>';

            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: identityPoolId,
                Logins : {
                    'cognito-idp.us-east-1.amazonaws.com/us-east-1_gplidiDbz': result.getIdToken().getJwtToken()
                }
            })

            // Instantiate aws sdk service objects now that the credentials have been updated.
            // example: var s3 = new AWS.S3()
        },

        onFailure: err => {
            alert(err)
        }
    })
}

SignInForm.onsubmit = SignIn