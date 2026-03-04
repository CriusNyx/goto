# GOTO
function goto
  goto-bin $argv
  if test $status -eq 0
    set result $(cat /tmp/goto.output)
    if test -n "$result"
      cd $result
    end
  end
end

function gt
  goto $argv
end

function pushto
  goto-bin $argv
  if test $status -eq 0
    set result $(cat /tmp/goto.output)
    if test -n "$result"
      pushd $result
    end
  end
end

function pt
  pushto $argv
end

eval "$(goto-bin --environment-variables)"
eval "$(goto-bin --completions)"