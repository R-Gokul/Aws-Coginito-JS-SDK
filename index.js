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