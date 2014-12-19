<% Option Explicit


Const Filename = "default.txt"		' file to read
Const ForReading = 1, ForWriting = 2, ForAppending = 3
Const TristateUseDefault = -2, TristateTrue = -1, TristateFalse = 0

' Create a filesystem object
Dim FSO

set FSO = server.createObject("Scripting.FileSystemObject")



' Map the logical path to the physical system path
Dim Filepath
IF Request.QueryString("loading") <> "" Then
	Filepath = Server.MapPath(Request.QueryString("loading") & ".txt")
Else
	Filepath = Server.MapPath(Filename)
End IF


if FSO.FileExists(Filepath) Then
    Dim TextStream
	Set TextStream = FSO.OpenTextFile(Filepath, ForReading, False, TristateUseDefault)
	' Read file in one hit
	
	Dim Contents
	Contents = TextStream.ReadAll

        Response.ContentType = "application/json; charset=UTF-8"
        Response.write Request.QueryString("callback") & "(" & Contents & ")"
	
	TextStream.Close
	Set TextStream = nothing
	
Else

	Response.Write "<h3><i><font color=red> File " & Filename &_
                      " does not exist</font></i></h3>"

End If

Set FSO = nothing

%>
