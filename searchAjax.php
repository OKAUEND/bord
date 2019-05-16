<?php

require('DBconnect.php');

header('Content-Type: application/json; charset=UTF-8');

if(empty($_POST))
{
    //値が送られてきていないのでエラーを返す
    header('');
}

$thread_id = $_POST['thread_id'];
$response_no = explode(',',$_POST['data']);

try
{
    $pdo = new DBconnect();

    $select = 'ID';
    $from   = 'comment';

    $where = '';

    $count = 1;

    $data = array();

    $in = '';

    foreach($response_no as $value)
    {
        if(!empty($in))
        {
            $in =  $in.',';
        }

        $in = $in.':ID'.$count;

        $data += array(
            ':ID'.$count => $value
        );
        $count += 1;
    }

    $in = 'ID IN ( '.$in.' )';

    $where = $in.' AND delete_flg = false';

    $sql = 'SELECT '.$select.' FROM '.$from.' WHERE '.$where;

    $stmt = $pdo->plural($sql,$data);
    
    $result = $stmt->fetchAll();

    echo json_encode($result);
}
catch(Exception $e)
{
    //サーバーエラーとしてフロントにエラー情報を返す
    header("HTTP/1.1 500 Internal Server Error");
    die();
}