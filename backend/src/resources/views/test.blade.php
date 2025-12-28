<form type="submit" action="/register/user" method="post">
@csrf
<input type="text" name="name" />
<input type="text" name="email"/>
<input type="text" name="password"/>
<button>送信</button>
</form>
