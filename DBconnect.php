<?php
class DBconnect{
    const DB_NAME   = 'comment_bord';
    const HOST      = 'localhost';
    const UTF       = 'utf8';
    const USER      = 'bord';
    const PASSWORD  = 'bord';
    const OPTION    = array(
                            //
                                PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING,
                                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                                PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
                                PDO::ATTR_EMULATE_PREPARES => true,
                            );
    
    //DBに接続を行う関数
    private function pdo(){
        $dsn = "mysql:dbname=".self::DB_NAME.";host=".self::HOST.";charset=".self::UTF;
        try
        {
            $pdo = new PDO($dsn,self::USER,self::PASSWORD,self::OPTION);
        }
        catch(Exception $e)
        {
            echo 'error' .$e->getMessage;
            die();
        }
        return $pdo;
    }

    private function pdoPrepare($sql,$data)
    {
        $tmp = $this->pdo();
        return $tmp->prepare($sql);
    }

    //SQL文を発行する時に使用する関数
    function plural($sql,$data)
    {
        $stmt = $this->pdoPrepare($sql,$data);
        $stmt->execute($data);
        return $stmt;
    }

    //SQLを発行し、真偽値を返す用関数
    function IsExecuteAccess($sql,$data)
    {
        $stmt = $this->pdoPrepare($sql,$data);
        $stmt = $stmt->execute($data);
        return $stmt;
    }
}