<?php /* утф-8 */

$GLOBALS['VOS_DB_HOST']="localhost:3306";
$GLOBALS['VOS_DB_DB_NAME']="test_db_name";
$GLOBALS['VOS_DB_USER']="test_admin_user_for_that";
$GLOBALS['VOS_DB_PWD']="test_password";

//escapes string before passing it into sql request
function mysql_escape_mimic($inp){
	if(is_array($inp)){
		return array_map(__METHOD__,$inp);
	}
	if(!empty($inp) && is_string($inp)){
		return str_replace(array('\\',"\0","\n","\r","'",'"',"\x1a"),array('\\\\','\\0','\\n','\\r',"\\'",'\\"','\\Z'),$inp);
	}
	return $inp;
}
function strPrepariren($str){
	$newString=htmlspecialchars($str,ENT_QUOTES | ENT_SUBSTITUTE,'UTF-8');
	return $newString;
}
//vosmer@yandex.ru copyright
function vos_db($sql="",$typ='select'){
	global $VOS_DB_HOST, $VOS_DB_USER, $VOS_DB_PWD,$VOS_DB_DB_NAME;
	$result='';
	if($sql==""){return false;}
	if(!$conn=mysql_connect($VOS_DB_HOST, $VOS_DB_USER, $VOS_DB_PWD)){
		die('Could not connect: '.mysql_error()); //TODO log error and return name of the file instead of error
		exit;
	}
	if(!mysql_select_db($VOS_DB_DB_NAME, $conn)){
		die('Could not select database: '.mysql_error());//TODO log error and return name of the file instead of error
		exit;
	}
	mysql_query("SET NAMES 'utf8'");
	$res=mysql_query($sql, $conn);
	if($typ=='insert'){//вставка
		$newbee_id=mysql_insert_id();
		if($res and $newbee_id!=''){
			$result=$newbee_id;
		}else{
			$result=false;
		}
	}
	if($typ=='exists'){//проверка на присутствие
		$result=mysql_result($res,0,0)?true:false; 
	}
	if($typ=='select'){//выборка
		if($res){
			while($row=mysql_fetch_assoc($res)){
				$result[]=$row;
			}
		}else{
			$result=false;
		}
	}
	if($typ=='update'){//изменение
		if(!$res){
			$result=false;
		}else{
			$result=true;
		}
	}
	mysql_close($conn);
	return $result;
}

//validation method for person BIG data 
function validatePerson($array=false){
	if(!$array){return false;}
	$res="valid";
	$errArr=array();
	//first name
	if (empty($_POST["firstName"])) {
		$errArr["firstName"]="Missing";
		$res="invalid";
	} else {
		if(preg_match("/^[-\' \p{L}]+$/u", $_POST["firstName"]) > 0){
			
		}else{
			$errArr["firstName"]="Incorrect";
			$res="invalid";
		}
	}
	//last name
	if (empty($_POST["lastName"])) {
		$errArr["lastName"]="Missing";
		$res="invalid";
	} else {
		if(preg_match("/^[-\' \p{L}]+$/u", $_POST["lastName"]) > 0){
			
		}else{
			$errArr["lastName"]="Incorrect";
			$res="invalid";
		}
	}
	//middle name
	if (empty($_POST["midName"])) {
		$errArr["midName"]="Missing";
		$res="invalid";
	} else {
		if(preg_match("/^[-\' \p{L}]+$/u", $_POST["midName"]) > 0){
			
		}else{
			$errArr["midName"]="Incorrect";
			$res="invalid";
		}
	}
	
	if($res=="invalid"){
		return $errArr;
	}else{
		return $res;
	}
}
if ( !empty( $_POST ) ) {
	//remove person from DB users table 
	if($_POST['actionType'] and $_POST['actionType']=="delPerson" and $_POST['personId']!=""){
		$returnJson=false;
		$escapeID=mysql_escape_mimic(strPrepariren($_POST['personId']));//validate id and prepare for sql
		//sql
		$sqlUpdate1="UPDATE `users` "
			."SET `users`.`active`=0 "
			."WHERE `users`.`id`=".$escapeID.";";
		$personDeleted=vos_db($sqlUpdate1,'update');//execute sql
		echo json_encode($personDeleted);//return responce as json
		exit;//stop processing
	}
	//edit person from DB users table 
	if($_POST['actionType'] and $_POST['actionType']=="editPerson" and $_POST['personId']!=""){
		$returnJson=false;
		$escapeID=mysql_escape_mimic(strPrepariren($_POST['personId']));//validate id and prepare for sql

		//prepare data to past into DB
		$escapedFName=($_POST['firstName'])			?(mysql_escape_mimic(strPrepariren($_POST['firstName'])))		:"";
		$escapedLName=($_POST['lastName'])			?(mysql_escape_mimic(strPrepariren($_POST['lastName'])))		:"";
		$escapedMName=($_POST['midName'])			?(mysql_escape_mimic(strPrepariren($_POST['midName'])))			:"";
		if(isset($_POST['dob']) and $_POST['dob']!=""){
			$escapedDOB=mysql_escape_mimic(strPrepariren($_POST['dob']));
			$dt = explode('.',$escapedDOB);
			$dt2= $dt[2] . '-' . $dt[1] . '-' .$dt[0];
		}else{
			$escapedDOB=null;
		}
		$escapedPhone=($_POST['phone'])				?(mysql_escape_mimic(strPrepariren($_POST['phone'])))			:"";
		$escapedEmail=($_POST['email'])				?(mysql_escape_mimic(strPrepariren($_POST['email'])))			:"";
		$escapedLogin=($_POST['login'])				?(mysql_escape_mimic(strPrepariren($_POST['login'])))			:"";
		$escapedPass=(isset($_POST['pass']))		?(mysql_escape_mimic(strPrepariren($_POST['pass'])))			:"";//TODO hash it
		$escapedPhoto=($_POST['uploadedPhotoUrl'])	?(mysql_escape_mimic(strPrepariren($_POST['uploadedPhotoUrl']))):"";

		//sql
		$sqlUpdate2="UPDATE `users` SET";
			$sqlUpdate2.=($escapedFName!="")	?(" `users`.`fname`='".$escapedFName."'")	:"";
			$sqlUpdate2.=($escapedLName!="")	?(", `users`.`lname`='".$escapedLName."'")	:"";
			$sqlUpdate2.=($escapedMName!="")	?(", `users`.`mname`='".$escapedMName."'")	:"";
			$sqlUpdate2.=($escapedDOB!="")		?(", `users`.`dob`='".$dt2."'")		:"";
			$sqlUpdate2.=($escapedPhone!="")	?(", `users`.`phone`='".$escapedPhone."'")	:"";
			$sqlUpdate2.=($escapedEmail!="")	?(", `users`.`email`='".$escapedEmail."'")	:"";
			$sqlUpdate2.=($escapedLogin!="")	?(", `users`.`login`='".$escapedLogin."'")	:"";
			$sqlUpdate2.=($escapedPass!="")		?(", `users`.`pass`='".$escapedPass."'")	:"";
			$sqlUpdate2.=($escapedPass!="")		?(", `users`.`photo`='".$escapedPhoto."'")	:"";
		$sqlUpdate2.=" WHERE `users`.`id`=".$escapeID.";";
		//var_dump($sqlUpdate2);die();
		$personEdited=vos_db($sqlUpdate2,'update');//execute sql
		echo json_encode($personEdited);//return responce as json
		exit;//stop processing
	}
	//get list of active persons fron DB users table
	if($_POST['actionType'] and $_POST['actionType']=="getPersons"){
		//sql
		$sqlSelect1="SELECT `fname` as firstName, `lname` as lastName, `mname` as midName, `dob` , `phone`, `email`, `login`, `photo` as uploadedPhotoUrl,`id` as personId FROM `users` WHERE `active`=1; ";
		$personsArr=vos_db($sqlSelect1,'select');//execute sql
		if(is_array($personsArr) and $personsArr){
			echo json_encode($personsArr);//return responce as json
			exit;//stop processing
		}
		exit;
	}
	
	if($_POST['actionType'] and $_POST['actionType']=="addPerson" and validatePerson($_POST)=="valid"){
		if(!isset($_POST['personID']) or $_POST['personID']==""){
			//TODO save person into db
			$returnJson=false;
			//prepare data to past into DB
			$escapedFName=($_POST['firstName'])			?(mysql_escape_mimic(strPrepariren($_POST['firstName'])))		:"";
			$escapedLName=($_POST['lastName'])			?(mysql_escape_mimic(strPrepariren($_POST['lastName'])))		:"";
			$escapedMName=($_POST['midName'])			?(mysql_escape_mimic(strPrepariren($_POST['midName'])))			:"";
			if(isset($_POST['dob']) and $_POST['dob']!=""){
				$escapedDOB=mysql_escape_mimic(strPrepariren($_POST['dob']));
				$dt = explode('.',$escapedDOB);
				$dt2= $dt[2] . '-' . $dt[1] . '-' .$dt[0];
			}else{
				$escapedDOB=null;
			}
			$escapedPhone=($_POST['phone'])				?(mysql_escape_mimic(strPrepariren($_POST['phone'])))			:"";
			$escapedEmail=($_POST['email'])				?(mysql_escape_mimic(strPrepariren($_POST['email'])))			:"";
			$escapedLogin=($_POST['login'])				?(mysql_escape_mimic(strPrepariren($_POST['login'])))			:"";
			$escapedPass=(isset($_POST['pass']))		?(mysql_escape_mimic(strPrepariren($_POST['pass'])))			:"";//TODO hash it
			$escapedPhoto=($_POST['uploadedPhotoUrl'])	?(mysql_escape_mimic(strPrepariren($_POST['uploadedPhotoUrl']))):"";

			$sqlInsert1="INSERT INTO "
				."`users` (`fname`, `lname`, `mname`, `dob`, `phone`, `email`, `login`, `pass`, `photo`) "
				."VALUES('".$escapedFName."','".$escapedLName."','".$escapedMName."','".$dt2."','".$escapedPhone."','".$escapedEmail."','".$escapedLogin."','".$escapedPass."','".$escapedPhoto."')";
			$newPersonAdded=vos_db($sqlInsert1,'insert');
			$returnJson['dob1']=$escapedDOB;
			$returnJson['dob']=$dt2;
			$returnJson['newPersonAdded']=($newPersonAdded)?$newPersonAdded:'no new area added';
			$returnJson['status']=($newPersonAdded)?'success':'fail';
			
			echo json_encode($returnJson);
			exit;
		}
		if(isset($_POST['personID']) and $_POST['personID']!=""){
			//TODO edit person in db
		}
	}
}
//file upload hanle separately to avoid data loss and see result on the fly
if ( !empty( $_FILES ) ) {
	//TODO validate
	$tempPath = $_FILES[0][ 'tmp_name' ];
	$uploadPath = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'photosUploaded' . DIRECTORY_SEPARATOR . $_FILES[0][ 'name' ];
	move_uploaded_file( $tempPath, $uploadPath );
	$answer = array( 
		'answer' => 'File transfer completed',
		'fileUrl'=>'photosUploaded/'.$_FILES[0][ 'name' ]
	);
	$json = json_encode( $answer );
	echo $json;
	exit;
} else {
	echo 'No files';
	exit;
}

?>
