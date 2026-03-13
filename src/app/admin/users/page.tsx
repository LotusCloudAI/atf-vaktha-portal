  <button
                    onClick={() => updateRole(user.id, "member")}
                    className="text-red-600"
                  >
                    Demote
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
